import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnnotationCanvas from '../components/AnnotationCanvas';
import pdfService from '../services/pdfService';
import securityService from '../services/securityService';
import annotationService from '../services/annotationService';
import networkService from '../services/networkService';

const ViewerScreen = ({ route }) => {
  const { fileUri } = route.params;
  const [savedAnnotations, setSavedAnnotations] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [pdfSource, setPdfSource] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProtected, setIsProtected] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [layoutMode, setLayoutMode] = useState('fitWidth');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isOnline, setIsOnline] = useState(true);
  const [extractingText, setExtractingText] = useState(false);
  const pdfRef = useRef(null);

  const extractTextFromPage = async (pageNum) => {
    setExtractingText(true);
    try {
      const text = await pdfService.extractTextFromPage(pdfRef, pageNum);
      return text || `Unable to extract text from page ${pageNum}`;
    } catch (error) {
      console.error('Text extraction failed:', error);
      return '';
    } finally {
      setExtractingText(false);
    }
  };

  // Load PDF on mount
  useEffect(() => {
    // Initialize network listener
    const unsubscribe = networkService.initNetworkListener((isConnected) => {
      setIsOnline(isConnected);
      if (isConnected && syncStatus === 'error') {
        handleManualSync();
      }
    });

    const loadPDF = async () => {
      try {
        // Check file protection status
        const protection = await securityService.checkMIPCompliance(fileUri);
        setIsProtected(!!protection);

        // Load PDF data
        const { uri, pageCount } = await pdfService.loadPDF(fileUri);
        setPdfSource({ uri });
        setPageCount(pageCount);

        // Load saved annotations
        const annotations = await annotationService.loadAnnotations(fileUri);
        if (annotations) {
          setSavedAnnotations(annotations);
        }
      } catch (error) {
        console.error('Failed to load PDF:', error);
        Alert.alert('Error', 'Failed to load PDF document');
      }
    };

    loadPDF();
  }, [fileUri]);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < pageCount) {
      pdfRef.current?.setPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      pdfRef.current?.setPage(currentPage - 1);
    }
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  // Layout modes
  const toggleLayoutMode = () => {
    setLayoutMode(prev => prev === 'fitWidth' ? 'single' : 'fitWidth');
  };

  return (
    <View style={styles.container}>
      {pdfSource && (
        <>
          <Pdf
            ref={pdfRef}
            source={pdfSource}
            style={styles.pdf}
            onLoadComplete={(numberOfPages, width, height) => {
              setPdfDimensions({ width, height });
            }}
            scale={zoom}
            minScale={0.5}
            maxScale={4}
            spacing={10}
            fitPolicy={layoutMode}
            onPageChanged={(page) => setCurrentPage(page)}
            enablePaging={true}
          />

          {/* Toolbar */}
          <View style={styles.toolbar}>
            <TouchableOpacity onPress={goToPrevPage} disabled={currentPage <= 1}>
              <Icon name="chevron-left" size={30} color={currentPage <= 1 ? '#ccc' : '#000'} />
            </TouchableOpacity>

            <View style={styles.pageInfo}>
              <Icon name="description" size={20} color="#555" />
              <Text style={styles.pageText}>{currentPage} / {pageCount}</Text>
            </View>

            <TouchableOpacity onPress={goToNextPage} disabled={currentPage >= pageCount}>
              <Icon name="chevron-right" size={30} color={currentPage >= pageCount ? '#ccc' : '#000'} />
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity onPress={() => setShowAnnotations(!showAnnotations)}>
              <Icon 
                name={showAnnotations ? 'edit-off' : 'edit'} 
                size={25} 
                color={showAnnotations ? '#6200ee' : '#000'} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={zoomOut}>
              <Icon name="zoom-out" size={25} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={zoomIn}>
              <Icon name="zoom-in" size={25} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleLayoutMode}>
              <Icon name={layoutMode === 'fitWidth' ? 'view-agenda' : 'view-column'} size={25} color="#000" />
            </TouchableOpacity>

            {isProtected && (
              <Icon name="lock" size={25} color="#d32f2f" style={styles.protectedIcon} />
            )}
            <TouchableOpacity onPress={handleManualSync}>
              <Icon 
                name={
                  !isOnline ? 'cloud-off' :
                  syncStatus === 'success' ? 'cloud-done' :
                  syncStatus === 'error' ? 'cloud-off' :
                  syncStatus === 'syncing' ? 'cloud-upload' :
                  'cloud'
                } 
                size={25} 
                color={
                  !isOnline ? '#9E9E9E' :
                  syncStatus === 'success' ? '#4CAF50' :
                  syncStatus === 'error' ? '#F44336' :
                  syncStatus === 'syncing' ? '#FFC107' :
                  '#2196F3'
                }
              />
            </TouchableOpacity>
          </View>

          {/* Annotation Canvas */}
          {showAnnotations && (
            <AnnotationCanvas 
              pdfDimensions={pdfDimensions}
              onSaveAnnotation={async (annotations) => {
                try {
                  await annotationService.saveAnnotations(fileUri, annotations);
                  setSavedAnnotations(annotations);
                  Alert.alert('Success', 'Annotations saved successfully');
                } catch (error) {
                  console.error('Failed to save annotations:', error);
                  Alert.alert('Error', 'Failed to save annotations');
                }
              }}
              initialAnnotations={savedAnnotations}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  toolbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pageText: {
    marginLeft: 5,
    fontSize: 16
  },
  spacer: {
    width: 20
  },
  protectedIcon: {
    marginLeft: 10
  }
});

  const handleManualSync = async () => {
    try {
      setSyncStatus('syncing');
      await networkService.manualSync();
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    return () => {
      // Clean up network listener
      networkService.initNetworkListener().then(unsubscribe => unsubscribe());
    };
  }, []);

export default ViewerScreen;

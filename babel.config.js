module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }], // ✅ Ensure 'loose: true'
    ['@babel/plugin-transform-private-property-in-object', { loose: true }], // ✅ Ensure 'loose: true'
    'react-native-reanimated/plugin',
    'module:react-native-dotenv'
  ]
};

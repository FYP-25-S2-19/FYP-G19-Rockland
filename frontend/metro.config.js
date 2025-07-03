const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// get default Expo config
const config = getDefaultConfig(__dirname);

// remove 'svg' from assetExts and add to sourceExts
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// attach svg-transformer into NativeWind
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// finally wrap with NativeWind
module.exports = withNativeWind(config, { input: './global.css' });

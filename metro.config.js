// Learn more https://docs.expo.io/guides/customizing-metro
/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolver configurations
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};

// Module resolution for specific packages
config.resolver.extraNodeModules['expo-modules-core'] = path.resolve(__dirname, 'node_modules/expo-modules-core');
config.resolver.extraNodeModules['expo-module-core'] = path.resolve(__dirname, 'node_modules/expo-modules-core');
config.resolver.extraNodeModules['expo-crypto'] = path.resolve(__dirname, 'node_modules/expo-crypto');
config.resolver.extraNodeModules['expo-sqlite'] = path.resolve(__dirname, 'node_modules/expo-sqlite');
config.resolver.extraNodeModules['expo-router'] = path.resolve(__dirname, 'node_modules/expo-router');

// Add specific module mappings to fix build issues
config.resolver.extraNodeModules['expo-module-gradle-plugin'] = path.resolve(__dirname, 'node_modules/expo-modules-core');

// Polyfills
config.resolver.extraNodeModules['buffer'] = path.resolve(__dirname, 'node_modules/buffer');

// Performance optimizations
config.maxWorkers = 4;

// Watch configurations
config.watchFolders = Array.isArray(config.watchFolders) ? config.watchFolders : [];
if (!config.watchFolders.includes(__dirname)) {
  config.watchFolders.push(__dirname);
}

// Symlinks should be handled automatically by Metro in newer versions
config.resolver.disableHierarchicalLookup = false;
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Enable caching for faster rebuilds
config.cacheStores = config.cacheStores || [];
config.transformer.enableBabelRCLookup = false; // Use only babel.config.js

// Add specific module resolution for problematic modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix for expo-crypto and expo-modules-core issues
  if (moduleName === 'expo-module-gradle-plugin') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/expo-modules-core/android/build.gradle'),
      type: 'sourceFile',
    };
  }
  
  // Use default resolution for all other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
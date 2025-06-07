// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolver configurations
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = config.resolver.extraNodeModules || {};

// Module resolution for specific packages
config.resolver.extraNodeModules['expo-modules-core'] = path.resolve(__dirname, 'node_modules/expo-modules-core');
config.resolver.extraNodeModules['expo-sqlite'] = path.resolve(__dirname, 'node_modules/expo-sqlite');
config.resolver.extraNodeModules['expo-router'] = path.resolve(__dirname, 'node_modules/expo-router');

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

module.exports = config; 
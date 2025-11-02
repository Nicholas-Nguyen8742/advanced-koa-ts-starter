const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Building Koa TypeScript Starter...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.removeSync('dist');
  }

  // Copy templates
  fs.copySync('src/templates', 'dist/templates');
  console.log('✅ Templates copied');

  // Copy environment files if they exist
  if (fs.existsSync('.env')) {
    fs.copySync('.env', 'dist/.env');
    console.log('✅ Environment files copied');
  }

  // Run TypeScript compiler
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });

  console.log('🎉 Build completed successfully!');
  console.log('📁 Output directory: dist/');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

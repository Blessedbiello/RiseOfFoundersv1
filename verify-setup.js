#!/usr/bin/env node

/**
 * Rise of Founders - Setup Verification Script
 * 
 * Run this script to verify your local development environment
 * is properly configured before starting the game.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Rise of Founders - Setup Verification\n');

const checks = [];

// Environment file checks
function checkEnvFile(filePath, requiredVars) {
  const envPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(envPath)) {
    return { 
      success: false, 
      message: `❌ Environment file missing: ${filePath}` 
    };
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)
  );

  if (missingVars.length > 0) {
    return {
      success: false,
      message: `⚠️  ${filePath} missing or has placeholder values for: ${missingVars.join(', ')}`
    };
  }

  return { 
    success: true, 
    message: `✅ Environment file configured: ${filePath}` 
  };
}

// Service connection checks
function checkService(name, command, expectedOutput = null) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      timeout: 5000,
      stdio: 'pipe'
    }).trim();
    
    if (expectedOutput && !output.includes(expectedOutput)) {
      return { 
        success: false, 
        message: `❌ ${name} not responding as expected` 
      };
    }
    
    return { 
      success: true, 
      message: `✅ ${name} is running` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `❌ ${name} is not running or accessible` 
    };
  }
}

// Node.js version check
function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    return { 
      success: true, 
      message: `✅ Node.js ${version} (compatible)` 
    };
  } else {
    return { 
      success: false, 
      message: `❌ Node.js ${version} (requires 18+)` 
    };
  }
}

// Package installation check
function checkPackageInstallation() {
  const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
  const backendNodeModules = fs.existsSync(path.join(__dirname, 'packages/backend/node_modules'));
  const frontendNodeModules = fs.existsSync(path.join(__dirname, 'packages/frontend/node_modules'));

  if (nodeModulesExists || (backendNodeModules && frontendNodeModules)) {
    return { 
      success: true, 
      message: '✅ Packages installed' 
    };
  } else {
    return { 
      success: false, 
      message: '❌ Packages not installed - run: pnpm install' 
    };
  }
}

// Database connection check
function checkDatabaseConnection() {
  try {
    const envPath = path.join(__dirname, 'packages/backend/.env');
    if (!fs.existsSync(envPath)) {
      return { 
        success: false, 
        message: '❌ Backend .env file missing' 
      };
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    
    if (!dbUrlMatch || dbUrlMatch[1].includes('username:password')) {
      return { 
        success: false, 
        message: '⚠️  DATABASE_URL not configured in backend/.env' 
      };
    }

    // Try to test the connection by running prisma
    execSync('cd packages/backend && npx prisma db pull --force', { 
      encoding: 'utf8', 
      timeout: 10000,
      stdio: 'pipe'
    });
    
    return { 
      success: true, 
      message: '✅ Database connection successful' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: '❌ Database connection failed - check PostgreSQL and DATABASE_URL' 
    };
  }
}

// Run all checks
async function runChecks() {
  console.log('Running setup verification checks...\n');

  // Basic environment checks
  checks.push(checkNodeVersion());
  checks.push(checkPackageInstallation());
  
  // Environment file checks
  checks.push(checkEnvFile('packages/backend/.env', [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
    'ENCRYPTION_KEY',
    'HONEYCOMB_API_KEY',
    'GITHUB_CLIENT_ID',
    'OPENAI_API_KEY'
  ]));
  
  checks.push(checkEnvFile('packages/frontend/.env.local', [
    'NEXT_PUBLIC_API_URL'
  ]));

  // Service checks
  checks.push(checkService('PostgreSQL', 'pg_isready', 'accepting connections'));
  checks.push(checkService('Redis', 'redis-cli ping', 'PONG'));
  
  // Database connection check
  checks.push(checkDatabaseConnection());

  // Print results
  console.log('📋 Verification Results:\n');
  
  let allPassed = true;
  checks.forEach(check => {
    console.log(check.message);
    if (!check.success) allPassed = false;
  });

  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 All checks passed! You can start the game.');
    console.log('\nTo start the game:');
    console.log('1. Backend:  cd packages/backend && npm run dev');
    console.log('2. Frontend: cd packages/frontend && npm run dev');
    console.log('3. Visit:    http://localhost:3000');
  } else {
    console.log('⚠️  Some checks failed. Please review the issues above.');
    console.log('\nFor detailed setup instructions, see: SETUP.md');
  }
  
  console.log('='.repeat(60));
}

runChecks().catch(console.error);
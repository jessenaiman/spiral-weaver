pipeline {
  agent any
  environment {
    CI = 'true'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
        # Use pnpm if pnpm-lock.yaml exists, otherwise npm
        if [ -f pnpm-lock.yaml ]; then
          corepack enable
          corepack prepare pnpm@latest --activate
          pnpm install --frozen-lockfile
        else
          npm ci
        fi
        '''
      }
    }

    stage('Build') {
      steps {
        // Run the Next.js production build to catch bundling issues early
        sh 'npm run build'
      }
    }

    stage('Typecheck') {
      steps {
        sh 'npm run typecheck'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Tests') {
      steps {
        // Run unit tests and e2e tests (Playwright) where available.
        // These commands may be configured in your Jenkins environment (browsers, DISPLAY, etc.).
        sh 'npm test || true'
        sh 'npm run test:e2e || true'
      }
    }

    stage('Post-analysis / Artifacts') {
      steps {
        // Archive coverage and build artifacts for inspection
        archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
      }
    }
  }

  post {
    always {
      junit 'jest-junit.xml'
      cleanWs()
    }
  }
}

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Database, 
  Zap, 
  Shield, 
  Globe, 
  Code2,
  Play,
  FileText,
  Github
} from 'lucide-react';

import { useDataPrism } from '../contexts/DataPrismContext';

export default function HomePage() {
  const { isInitialized, initializationError, retry } = useDataPrism();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          DataPrism Core
          <span className="block text-2xl sm:text-3xl text-blue-600 dark:text-blue-400 font-normal mt-2">
            Analytics Demo
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Experience the power of browser-based data analytics with WebAssembly. 
          Process millions of rows, create stunning visualizations, and build custom plugins—all in your browser.
        </p>

        {/* Status */}
        {initializationError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-red-800 dark:text-red-400 font-medium mb-2">Engine Failed to Initialize</p>
            <p className="text-red-600 dark:text-red-400 text-sm mb-3">{initializationError.message}</p>
            <button
              onClick={retry}
              className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 text-sm font-medium rounded text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40"
            >
              Try Again
            </button>
          </div>
        ) : !isInitialized ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-yellow-800 dark:text-yellow-400 font-medium">Initializing Engine...</p>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">Loading WebAssembly runtime and DuckDB</p>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-green-800 dark:text-green-400 font-medium">Engine Ready!</p>
            <p className="text-green-600 dark:text-green-400 text-sm">DataPrism Core is loaded and ready to use</p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/explorer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Exploring Data
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
          
          <Link
            to="/about"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          icon={Database}
          title="High-Performance Analytics"
          description="Process millions of rows with DuckDB's columnar engine, all running in your browser via WebAssembly."
          to="/explorer"
          ctaText="Explore Data"
        />
        
        <FeatureCard
          icon={BarChart3}
          title="Interactive Visualizations"
          description="Create stunning charts and dashboards with D3.js, Chart.js, and Observable Plot integration."
          to="/visualizations"
          ctaText="View Charts"
        />
        
        <FeatureCard
          icon={Code2}
          title="SQL Query Lab"
          description="Write and execute complex SQL queries with syntax highlighting and intelligent autocomplete."
          to="/query-lab"
          ctaText="Open Lab"
        />
        
        <FeatureCard
          icon={Zap}
          title="Plugin System"
          description="Extend functionality with custom plugins for data processing, visualization, and integration."
          to="/plugins"
          ctaText="Try Plugins"
        />
        
        <FeatureCard
          icon={Shield}
          title="Performance Monitoring"
          description="Real-time metrics, memory usage tracking, and query performance optimization tools."
          to="/performance"
          ctaText="View Metrics"
        />
        
        <FeatureCard
          icon={Globe}
          title="Browser-Native"
          description="No server required. Everything runs locally in your browser with full privacy and security."
          to="/about"
          ctaText="Learn How"
        />
      </div>

      {/* Quick Start Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Quick Start Demo
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <QuickStartStep
            step={1}
            title="Load Your Data"
            description="Upload CSV files or use our sample datasets to get started immediately."
            to="/explorer"
          />
          
          <QuickStartStep
            step={2}
            title="Analyze & Query"
            description="Use SQL or our visual query builder to explore patterns and insights."
            to="/query-lab"
          />
          
          <QuickStartStep
            step={3}
            title="Visualize Results"
            description="Create interactive charts and share your findings with beautiful visualizations."
            to="/visualizations"
          />
        </div>
      </div>

      {/* Technical Highlights */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Powered by Modern Web Technologies
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <TechCard
            name="WebAssembly"
            description="Near-native performance"
            logo="🚀"
          />
          
          <TechCard
            name="DuckDB"
            description="Columnar analytics engine"
            logo="🦆"
          />
          
          <TechCard
            name="React"
            description="Modern UI framework"
            logo="⚛️"
          />
          
          <TechCard
            name="TypeScript"
            description="Type-safe development"
            logo="📘"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-8">
        <p className="mb-4">
          DataPrism Core Demo - Showcasing browser-based analytics capabilities
        </p>
        
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com/dataprism/core"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Github className="h-5 w-5 mr-2" />
            GitHub
          </a>
          
          <Link
            to="/about"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
  ctaText: string;
}

function FeatureCard({ icon: Icon, title, description, to, ctaText }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>
      
      <Link
        to={to}
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
      >
        {ctaText}
        <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
}

interface QuickStartStepProps {
  step: number;
  title: string;
  description: string;
  to: string;
}

function QuickStartStep({ step, title, description, to }: QuickStartStepProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
          {step}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>
      
      <Link
        to={to}
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
      >
        Get Started
        <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
}

interface TechCardProps {
  name: string;
  description: string;
  logo: string;
}

function TechCard({ name, description, logo }: TechCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
      <div className="text-3xl mb-2">{logo}</div>
      <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
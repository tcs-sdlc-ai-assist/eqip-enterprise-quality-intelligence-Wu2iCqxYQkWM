import { Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

/**
 * @module MainLayout
 * Main application layout component for eQIP Quality Intelligence.
 *
 * Wraps Sidebar + Header + content area (Outlet).
 * Enforces max-width 1280px desktop container, 12-column grid,
 * 24px gutters, 48px margins. Responsive breakpoints for
 * tablet (8 columns) and mobile (4 columns).
 *
 * Layout structure:
 * - Full-height flex row containing Sidebar (left) and main content area (right)
 * - Main content area is a flex column with Header (top) and scrollable content (bottom)
 * - Content area uses a responsive grid container with max-width constraint
 */

/**
 * MainLayout component providing the application shell with sidebar,
 * header, and routed content area.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} [props.children] - Optional children to render instead of Outlet.
 * @param {string} [props.className] - Additional CSS classes for the content container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered MainLayout element.
 */
export default function MainLayout({ children, className = '', testId }) {
  const contentClasses = [
    'flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin bg-gray-50',
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    'w-full max-w-[1280px] mx-auto',
    'px-6 lg:px-6 md:px-3 sm:px-2',
    'py-3',
    'grid',
    'grid-cols-4 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
    'gap-3',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-gray-50"
      data-testid={testId}
    >
      {/* Sidebar */}
      <Sidebar testId="main-layout-sidebar" />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <Header testId="main-layout-header" />

        {/* Scrollable content area */}
        <main className={contentClasses}>
          <div className={containerClasses}>
            <div className="col-span-4 sm:col-span-4 md:col-span-8 lg:col-span-12">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

MainLayout.propTypes = {
  /** Optional children to render instead of Outlet. */
  children: PropTypes.node,
  /** Additional CSS classes for the content container. */
  className: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};
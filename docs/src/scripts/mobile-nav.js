// Mobile navigation functionality
export function initMobileNav() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const sidebarToggle = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.getElementById('docs-sidebar');

  // Create overlay for mobile sidebar if it doesn't exist
  let mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
  if (!mobileSidebarOverlay) {
    mobileSidebarOverlay = document.createElement('div');
    mobileSidebarOverlay.className = 'fixed inset-0 bg-black/50 z-40 lg:hidden hidden';
    mobileSidebarOverlay.id = 'mobile-sidebar-overlay';
    document.body.appendChild(mobileSidebarOverlay);
  }

  // Mobile menu toggle
  menuToggle?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Sidebar toggle
  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('translate-x-0');
    sidebar?.classList.toggle('-translate-x-full');
    mobileSidebarOverlay.classList.toggle('hidden');
  });

  // Close sidebar when clicking overlay
  mobileSidebarOverlay.addEventListener('click', () => {
    sidebar?.classList.add('-translate-x-full');
    sidebar?.classList.remove('translate-x-0');
    mobileSidebarOverlay.classList.add('hidden');
  });
}
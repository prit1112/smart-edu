// Dashboard JavaScript for interactive elements

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('toggle-btn');

    // Function to handle sidebar toggle
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            // Mobile: overlay behavior
            sidebar.classList.toggle('open');
        } else {
            // Desktop: collapse behavior
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
        }
    }

    // Function to close mobile sidebar
    function closeMobileSidebar() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    // Add click event to toggle button
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        toggleSidebar();
    });

    // Close sidebar when clicking outside (mobile only)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 &&
            !sidebar.contains(event.target) &&
            !toggleBtn.contains(event.target) &&
            sidebar.classList.contains('open')) {
            closeMobileSidebar();
        }
    });

    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 768) {
            // Switch to desktop mode
            sidebar.classList.remove('open');
            // Ensure proper desktop state
            if (sidebar.classList.contains('collapsed')) {
                mainContent.classList.add('sidebar-collapsed');
            } else {
                mainContent.classList.remove('sidebar-collapsed');
            }
        } else {
            // Switch to mobile mode
            mainContent.classList.remove('sidebar-collapsed');
            sidebar.classList.remove('collapsed');
        }
    }

    window.addEventListener('resize', handleResize);

    // Initialize on load
    handleResize();

    // Smooth animations for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Progress bar animations
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.setProperty('--progress-width', width);
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });

    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('.card, .assignment-item, .timeline-item');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });

        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Notification button interaction
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn.addEventListener('click', function() {
        // Placeholder for notification functionality
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });

    // Search functionality placeholder
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar button');

    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            // Placeholder for search functionality
            console.log('Searching for:', query);
            searchInput.style.borderColor = '#00d4ff';
            setTimeout(() => {
                searchInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }, 1000);
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Staggered reveal animation for sections
    const sections = document.querySelectorAll('.welcome-section, .overview-section, .progress-section, .schedule-section, .assignments-section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Performance Analytics View Switching
    const controlBtns = document.querySelectorAll('.control-btn');
    const performanceViews = document.querySelectorAll('.performance-view');

    controlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            controlBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Hide all views
            performanceViews.forEach(view => view.classList.remove('active'));
            // Show selected view
            const viewId = this.getAttribute('data-view') + '-view';
            document.getElementById(viewId).classList.add('active');
        });
    });

    // Chart Toggle Functionality
    const chartToggles = document.querySelectorAll('.chart-toggle');
    chartToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            const parentCard = this.closest('.chart-card');
            const toggles = parentCard.querySelectorAll('.chart-toggle');

            // Update toggle states
            toggles.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Here you would switch between chart types
            // For now, just log the action
            console.log(`Switching to ${chartType} chart`);
        });
    });

    // GPA circular progress animation
    const circularProgress = document.querySelector('.circular-progress circle:last-child');
    if (circularProgress) {
        const circumference = 2 * Math.PI * 50; // radius is 50
        circularProgress.style.strokeDasharray = circumference;
        const gpa = parseFloat(document.querySelector('.gpa-number').textContent) || 3.7;
        const offset = circumference - (gpa / 4) * circumference;
        circularProgress.style.strokeDashoffset = circumference;
        setTimeout(() => {
            circularProgress.style.strokeDashoffset = offset;
        }, 1000);
    }

    // Advanced Chart Initializations
    // Performance Radar Chart
    const radarCtx = document.getElementById('performanceRadar');
    if (radarCtx) {
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'],
                datasets: [{
                    label: 'Your Performance',
                    data: [95, 78, 88, 92, 85, 90],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00d4ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // GPA Trend Chart
    const gpaTrendCtx = document.getElementById('gpaTrend');
    if (gpaTrendCtx) {
        new Chart(gpaTrendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'GPA Trend',
                    data: [3.2, 3.4, 3.1, 3.6, 3.8, 3.7],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00d4ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 2.5,
                        max: 4.0,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Grade Distribution Chart
    const gradeDistCtx = document.getElementById('gradeDistribution');
    if (gradeDistCtx) {
        new Chart(gradeDistCtx, {
            type: 'doughnut',
            data: {
                labels: ['A', 'B', 'C', 'D'],
                datasets: [{
                    data: [45, 35, 15, 5],
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    // Trends Chart
    const trendsCtx = document.getElementById('trendsChart');
    if (trendsCtx) {
        new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                datasets: [{
                    label: 'Mathematics',
                    data: [85, 87, 82, 90, 88, 92],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Physics',
                    data: [78, 75, 80, 82, 79, 85],
                    borderColor: '#8a2be2',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Chemistry',
                    data: [88, 90, 85, 87, 89, 91],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        max: 95,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    }

    // Comparison Chart
    const comparisonCtx = document.getElementById('comparisonChart');
    if (comparisonCtx) {
        new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: ['You', 'Class Avg', 'Top 10%', 'Top Performer'],
                datasets: [{
                    label: 'GPA',
                    data: [3.7, 3.2, 3.8, 3.9],
                    backgroundColor: [
                        '#00d4ff',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 193, 7, 0.6)',
                        'rgba(40, 167, 69, 0.6)'
                    ],
                    borderWidth: 0,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 3.0,
                        max: 4.0,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Accessibility improvements
    // Add focus management for sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('focus', function() {
            this.style.outline = '2px solid #00d4ff';
        });
        link.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Keyboard navigation for sidebar toggle
    toggleBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    // Responsive adjustments
    function handleResize() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
        }
    }

    window.addEventListener('resize', handleResize);

    // Theme toggle placeholder (for future dark/light mode)
    // const themeToggle = document.createElement('button');
    // themeToggle.textContent = 'Toggle Theme';
    // themeToggle.style.position = 'fixed';
    // themeToggle.style.bottom = '20px';
    // themeToggle.style.right = '20px';
    // document.body.appendChild(themeToggle);

    // Performance optimization: Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            // Placeholder for scroll-based animations or lazy loading
        }, 16);
    });

    // Initialize tooltips or additional UI elements if needed
    // This could be expanded for more interactive features

    console.log('Dashboard JavaScript loaded successfully');
});
function markAsSeen(notificationId) {
  fetch('/student/notifications/mark-seen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notificationId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const card = document.querySelector('[data-id="' + notificationId + '"]');
      if (card) {
        card.classList.remove('unseen');
        card.classList.add('seen');
        const indicator = card.querySelector('.unread-indicator');
        if (indicator) {
          indicator.outerHTML = '<span class="read-indicator"><i class="fas fa-check"></i></span>';
        }
      }
      const unreadCount = document.querySelector('.filter-btn[href*="unread"] .count');
      if (unreadCount) {
        const currentCount = parseInt(unreadCount.textContent) - 1;
        if (currentCount > 0) {
          unreadCount.textContent = currentCount;
        } else {
          unreadCount.remove();
        }
      }
    }
  })
  .catch(error => {
    console.error('Error marking notification as seen:', error);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const notificationCards = document.querySelectorAll('.notification-card');
    notificationCards.forEach(card => {
      card.addEventListener('click', function() {
        const notificationId = this.getAttribute('data-id');
        if (this.classList.contains('unseen')) {
          markAsSeen(notificationId);
        }
      });
    });
});
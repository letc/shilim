/**
 * Security Utilities for Shilim Project
 * Provides XSS protection, input validation, and sanitization
 */

const SecurityUtils = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * Escapes dangerous characters
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize URL to prevent javascript: and data: protocols
     */
    sanitizeUrl(url) {
        if (typeof url !== 'string') return '';
        url = url.trim();
        
        // Block dangerous protocols
        const dangerous = /^(javascript|data|vbscript|file|about):/i;
        if (dangerous.test(url)) {
            console.warn('Blocked dangerous URL:', url);
            return '';
        }
        
        return url;
    },

    /**
     * Validate image URL
     */
    validateImageUrl(url) {
        if (!url) return true; // Allow empty
        url = this.sanitizeUrl(url);
        if (!url) return false;
        
        // Allow relative paths and http(s) URLs
        return /^(https?:\/\/|\.\/|\.\.\/|\/|[a-zA-Z0-9])/.test(url);
    },

    /**
     * Validate video URL (YouTube, Vimeo, or direct video)
     */
    validateVideoUrl(url) {
        if (!url) return false;
        url = this.sanitizeUrl(url);
        if (!url) return false;
        
        // Allow YouTube, Vimeo, or direct video files
        return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(url) ||
               /\.(mp4|webm|ogg)$/i.test(url) ||
               /^(\.\/|\.\.\/|\/)/.test(url);
    },

    /**
     * Sanitize text content (remove scripts, limit length)
     */
    sanitizeText(text, maxLength = 10000) {
        if (typeof text !== 'string') return '';
        
        // Remove script tags and event handlers
        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        text = text.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
        text = text.replace(/on\w+\s*=\s*'[^']*'/gi, '');
        
        // Limit length
        if (text.length > maxLength) {
            text = text.substring(0, maxLength);
        }
        
        return text;
    },

    /**
     * Validate JSON structure for project page
     */
    validateProjectPageJSON(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid JSON: not an object');
        }

        // Validate author
        if (data.author && typeof data.author !== 'string') {
            throw new Error('Invalid author field');
        }

        // Validate artistdescription
        if (data.artistdescription && typeof data.artistdescription !== 'string') {
            throw new Error('Invalid artistdescription field');
        }

        // Validate projects array
        if (data.projects && !Array.isArray(data.projects)) {
            throw new Error('Projects must be an array');
        }

        if (data.projects) {
            data.projects.forEach((project, index) => {
                if (!project.title || typeof project.title !== 'string') {
                    throw new Error(`Invalid title in project ${index}`);
                }

                if (project.sections && !Array.isArray(project.sections)) {
                    throw new Error(`Invalid sections in project ${index}`);
                }

                if (project.sections) {
                    project.sections.forEach((section, sIndex) => {
                        if (!['text', 'image', 'video'].includes(section.sectiontype)) {
                            throw new Error(`Invalid section type in project ${index}, section ${sIndex}`);
                        }
                    });
                }
            });
        }

        return true;
    },

    /**
     * Check if user is authenticated (for admin pages)
     * This is a simple implementation - replace with proper authentication
     */
    isAuthenticated() {
        const token = sessionStorage.getItem('admin_token');
        return token === 'shilim_admin_2026'; // In production, use proper JWT validation
    },

    /**
     * Prompt for authentication
     */
    authenticate() {
        const password = prompt('Enter admin password:');
        if (password === 'shilim2026') { // In production, hash and verify server-side
            sessionStorage.setItem('admin_token', 'shilim_admin_2026');
            return true;
        }
        return false;
    },

    /**
     * Protect admin page
     */
    protectAdminPage() {
        if (!this.isAuthenticated()) {
            if (!this.authenticate()) {
                alert('Authentication failed. Access denied.');
                window.location.href = 'index.html';
                return false;
            }
        }
        return true;
    },

    /**
     * Rate limiting for file operations
     */
    rateLimiter: {
        actions: {},
        check(action, maxPerMinute = 10) {
            const now = Date.now();
            if (!this.actions[action]) {
                this.actions[action] = [];
            }

            // Remove old entries (older than 1 minute)
            this.actions[action] = this.actions[action].filter(time => now - time < 60000);

            // Check limit
            if (this.actions[action].length >= maxPerMinute) {
                return false;
            }

            this.actions[action].push(now);
            return true;
        }
    },

    /**
     * Validate file upload
     */
    validateFileUpload(file, allowedTypes = ['.json'], maxSize = 5 * 1024 * 1024) {
        if (!file) {
            throw new Error('No file selected');
        }

        // Check file size (5MB default)
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        }

        // Check file type
        const fileName = file.name.toLowerCase();
        const isAllowed = allowedTypes.some(type => fileName.endsWith(type));
        if (!isAllowed) {
            throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        return true;
    }
};

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}

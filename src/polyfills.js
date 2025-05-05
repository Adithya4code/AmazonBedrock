// Polyfill for global (required by aws-sdk in browser environments)
if (typeof global === 'undefined') {
    window.global = window;
}
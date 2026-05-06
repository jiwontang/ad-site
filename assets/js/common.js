/* Common JavaScript - Navigation, Utilities */

$(document).ready(function() {
    // Mobile Navigation Toggle
    const hamburger = $('.hamburger');
    const nav = $('nav');

    hamburger.on('click', function() {
        hamburger.toggleClass('active');
        nav.toggleClass('active');
    });

    // Close menu when link clicked
    nav.find('a').on('click', function() {
        hamburger.removeClass('active');
        nav.removeClass('active');
    });

    // Close menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('header').length) {
            hamburger.removeClass('active');
            nav.removeClass('active');
        }
    });
});

// Utility Functions
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseNumber = (str) => {
    return parseInt(str.replace(/,/g, '')) || 0;
};

const formatCurrency = (num) => {
    return '₩' + formatNumber(Math.floor(num));
};

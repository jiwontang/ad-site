/* Youth Account Calculator Logic */

class YouthAccountCalculator {
    constructor() {
        this.monthlyAmount = 0;
        this.durationMonths = 0;
        this.interestRate = 0;
        this.chart = null;
    }

    // Input validation
    validateInputs(monthly, years, months, rate) {
        const errors = [];

        if (!monthly || monthly < 10000) {
            errors.push('월 납입 금액은 최소 10,000원 이상이어야 합니다.');
        }

        if (monthly > 5000000) {
            errors.push('월 납입 금액은 최대 5,000,000원 이하여야 합니다.');
        }

        const totalMonths = years * 12 + months;
        if (totalMonths < 1) {
            errors.push('가입 기간은 최소 1개월 이상이어야 합니다.');
        }

        if (totalMonths > 120) {
            errors.push('가입 기간은 최대 120개월(10년)입니다.');
        }

        if (rate < 0 || rate > 20) {
            errors.push('금리는 0% 이상 20% 이하여야 합니다.');
        }

        return errors;
    }

    // Calculate total deposit (monthly amount × months)
    calculateTotalInvested(monthly, durationMonths) {
        return monthly * durationMonths;
    }

    // Calculate total amount with compound interest
    // Formula for regular deposit: A = P * [((1+r)^n - 1) / r]
    // Where: A = final amount, P = monthly deposit, r = monthly rate, n = months
    calculateTotalAmount(monthly, durationMonths, annualRate) {
        const monthlyRate = annualRate / 100 / 12;
        
        if (monthlyRate === 0) {
            return monthly * durationMonths;
        }

        // Regular deposit future value formula
        const multiplier = (Math.pow(1 + monthlyRate, durationMonths) - 1) / monthlyRate;
        return monthly * multiplier;
    }

    // Calculate government support (월 납입액의 10~20%, 상한 월 10만원)
    calculateGovernmentSupport(monthly, durationMonths) {
        // 월 최대 지원금: 10만원
        const maxMonthlySupport = 100000;
        
        // 월 납입액의 10~20% (기본 10%)
        const monthlySupport = Math.min(monthly * 0.10, maxMonthlySupport);
        
        return monthlySupport * durationMonths;
    }

    // Calculate monthly breakdown for chart
    calculateMonthlyBreakdown(monthly, durationMonths, annualRate) {
        const monthlyRate = annualRate / 100 / 12;
        const monthlySupport = Math.min(monthly * 0.10, 100000);
        const breakdown = [];
        let principal = 0;
        let interest = 0;
        let support = 0;

        for (let i = 1; i <= durationMonths; i++) {
            principal += monthly;
            support += monthlySupport;
            
            // Calculate accumulated interest up to this month (on principal only)
            let accumulatedInterest = 0;
            for (let j = 1; j <= i; j++) {
                accumulatedInterest += monthly * Math.pow(1 + monthlyRate, i - j);
            }
            interest = accumulatedInterest - principal;

            if (i % 6 === 0 || i === 1 || i === durationMonths) {
                breakdown.push({
                    month: i,
                    principal: principal,
                    support: support,
                    interest: interest,
                    total: principal + support + interest
                });
            }
        }

        return breakdown;
    }

    // Calculate and update display
    calculate() {
        const monthlyAmount = parseInt($('#monthly-amount').val().replace(/,/g, '')) || 0;
        const years = parseInt($('#duration-years').val()) || 0;
        const months = parseInt($('#duration-months').val()) || 0;
        const interestRate = parseFloat($('#interest-rate').val()) || 0;

        // Validate inputs
        const errors = this.validateInputs(monthlyAmount, years, months, interestRate);
        if (errors.length > 0) {
            alert('입력 오류:\n\n' + errors.join('\n'));
            return;
        }

        // Store values
        this.monthlyAmount = monthlyAmount;
        this.durationMonths = years * 12 + months;
        this.interestRate = interestRate;

        // Calculate values
        const totalInvested = this.calculateTotalInvested(monthlyAmount, this.durationMonths);
        const govSupport = this.calculateGovernmentSupport(monthlyAmount, this.durationMonths);
        const totalInterest = this.calculateTotalAmount(monthlyAmount, this.durationMonths, interestRate) - totalInvested;
        const totalAmount = totalInvested + govSupport + totalInterest;

        // Update display
        $('#total-invested').text(formatCurrency(totalInvested));
        $('#govt-support').text(formatCurrency(govSupport));
        $('#total-interest').text(formatCurrency(totalInterest));
        $('#total-amount').text(formatCurrency(totalAmount));

        // Update chart
        this.updateChart();
    }

    // Create/Update chart
    updateChart() {
        const breakdown = this.calculateMonthlyBreakdown(
            this.monthlyAmount, 
            this.durationMonths, 
            this.interestRate
        );

        const chartContainer = $('#chart');
        
        if (breakdown.length === 0) {
            chartContainer.closest('.result-chart').removeClass('show');
            return;
        }

        chartContainer.closest('.result-chart').addClass('show');

        const ctx = document.getElementById('chart').getContext('2d');
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: breakdown.map(item => `${item.month}개월`),
                datasets: [
                    {
                        label: '총 자산',
                        data: breakdown.map(item => Math.floor(item.total)),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#4CAF50',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: '원금',
                        data: breakdown.map(item => Math.floor(item.principal)),
                        borderColor: '#90CAF9',
                        backgroundColor: 'rgba(144, 202, 249, 0.1)',
                        fill: false,
                        tension: 0.3,
                        pointBackgroundColor: '#90CAF9',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: '정부지원금',
                        data: breakdown.map(item => Math.floor(item.support)),
                        borderColor: '#FFD54F',
                        backgroundColor: 'rgba(255, 213, 79, 0.1)',
                        fill: false,
                        tension: 0.3,
                        pointBackgroundColor: '#FFD54F',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: '이자',
                        data: breakdown.map(item => Math.floor(item.interest)),
                        borderColor: '#FFB74D',
                        backgroundColor: 'rgba(255, 183, 77, 0.1)',
                        fill: false,
                        tension: 0.3,
                        pointBackgroundColor: '#FFB74D',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: '자산 누적 현황'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₩' + formatNumber(Math.floor(value));
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize calculator
let calculator = new YouthAccountCalculator();

$(document).ready(function() {
    // Format input values with commas
    $('#monthly-amount').on('blur', function() {
        const value = $(this).val();
        if (value) {
            $(this).val(formatNumber(parseInt(value.replace(/,/g, ''))));
        }
    });

    $('#monthly-amount').on('focus', function() {
        const value = $(this).val();
        if (value) {
            $(this).val(value.replace(/,/g, ''));
        }
    });

    // Real-time calculation on input change
    $('#monthly-amount, #duration-years, #duration-months, #interest-rate').on('change', function() {
        calculator.calculate();
    });

    // Calculate button click
    $('#calculate-btn').on('click', function() {
        calculator.calculate();
    });

    // Initial calculation
    calculator.calculate();

    // Allow Enter key for calculation
    $(document).on('keypress', function(e) {
        if (e.key === 'Enter' && $(e.target).closest('.calculator-form').length) {
            calculator.calculate();
        }
    });
});

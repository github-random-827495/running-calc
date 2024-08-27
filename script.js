document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('chart').getContext('2d');

    // Function to convert min:sec format to total seconds
    function parsePace(paceStr) {
        const parts = paceStr.split(':');
        const minutes = parseFloat(parts[0]);
        const seconds = parseFloat(parts[1]);
        return (minutes * 60) + seconds;
    }

    // Function to convert total seconds to min:sec format
    function secondsToPace(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Function to calculate percentage relative to VO2
    function paceToPercent(pace, vo2Pace) {
        return 100 - (100 * (pace - vo2Pace) / vo2Pace);
    }

    // Initialize Chart.js
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['S&C', 'LT1', 'LT2', 'VO2'],
            datasets: [{
                label: 'Pace',
                data: [0, 50, 75, 100], // Placeholder data
                borderColor: '#000000', // Black line
                borderWidth: 2,
                fill: false,
                pointRadius: [12, 10, 10, 10], // Larger dots
                pointBackgroundColor: ['#2196f3', '#4caf50', '#ff9800', '#d32f2f'], // Blue for S&C, Green for LT1, Orange for LT2, Red for VO2
                pointBorderColor: '#ffffff'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    min: 0,
                    max: 100
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Measurement (sec)'
                    },
                    ticks: {
                        callback: function(value) {
                            return secondsToPace(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide the legend to prevent clicking and toggling
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Display only the relevant label
                            const valueInSeconds = context.raw;
                            return `${context.dataset.label}: ${secondsToPace(valueInSeconds)}`;
                        },
                        title: function() {
                            // Do not display any title
                            return '';
                        }
                    }
                }
            }
        }
    });

    // Function to update the chart based on pace inputs
    function updateChart() {
        const vo2Pace = parsePace(document.getElementById('vo2Input').value);
        const lt2Pace = parsePace(document.getElementById('lt2Input').value);
        const lt1Pace = parsePace(document.getElementById('lt1Input').value);

        // Calculate percentages relative to VO2 pace
        const vo2Percent = 100;  // VO2 is always at 100%
        const lt2Percent = paceToPercent(lt2Pace, vo2Pace);
        const lt1Percent = paceToPercent(lt1Pace, vo2Pace);
        const sAndCPercent = 0; // S&C is always at 0%

        // Update chart data
        chart.data.datasets[0].data = [sAndCPercent, lt1Percent, lt2Percent, vo2Percent];
        chart.update();
    }

    // Function to synchronize slider and input
    function syncSliderInput(sliderId, inputId) {
        const slider = document.getElementById(sliderId);
        const input = document.getElementById(inputId);

        slider.addEventListener('input', function() {
            const valueInSeconds = slider.value;
            input.value = secondsToPace(valueInSeconds);
            updateChart();
        });

        input.addEventListener('input', function() {
            const [minutes, seconds] = input.value.split(':');
            const valueInSeconds = parseFloat(minutes) * 60 + parseFloat(seconds);
            slider.value = valueInSeconds;
            updateChart();
        });
    }

    // Synchronize sliders and inputs
    syncSliderInput('vo2Slider', 'vo2Input');
    syncSliderInput('lt2Slider', 'lt2Input');
    syncSliderInput('lt1Slider', 'lt1Input');

    // Initialize chart with default values
    updateChart();
});

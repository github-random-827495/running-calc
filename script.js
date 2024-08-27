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
                pointBorderColor: '#ffffff',
                // Add labels directly on the chart
                pointLabelFontSize: 14,
                pointLabelFontColor: '#333',
                pointLabelFontFamily: 'Helvetica Neue, Arial, sans-serif',
                pointLabelFontWeight: 'bold'
            }]
        },
        options: {
            scales: {
                x: {
                    display: false, // Hide x-axis text
                    grid: {
                        display: false // Hide x-axis gridlines
                    }
                },
                y: {
                    display: false, // Hide y-axis text
                    grid: {
                        display: false // Hide y-axis gridlines
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide the legend to prevent clicking and toggling
                },
                tooltip: {
                    enabled: false // Disable tooltips
                },
                datalabels: {
                    display: true, // Display labels
                    formatter: function(value, context) {
                        // Custom labels for each point
                        const labels = ['S&C', 'LT1', 'LT2', 'VO2'];
                        return labels[context.dataIndex];
                    },
                    color: '#333',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    anchor: 'end',
                    align: 'top',
                    offset: 10
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

        // Update results summary
        updateResults(vo2Pace, lt1Pace, lt2Pace);
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

    // Function to update results based on input values
    function updateResults(vo2Pace, lt1Pace, lt2Pace) {
        // Remove any previous advice
        const resultsSummary = document.getElementById('results-summary');
        resultsSummary.innerHTML = '';

        const vo2Lt2Diff = Math.abs(vo2Pace - lt2Pace);
        const lt1Lt2Diff = Math.abs(lt1Pace - lt2Pace);

        // Display advice based on conditions
        if (vo2Lt2Diff <= 60) { // Threshold of 60 seconds (adjust as needed)
            resultsSummary.innerHTML = '<p class="advice">Your VO2 Max pace and LT2 pace are too close. Focus on improving your VO2 Max.</p>';
        } else if (lt1Lt2Diff <= 60) { // Threshold of 60 seconds (adjust as needed)
            resultsSummary.innerHTML = '<p class="advice">Your LT1 pace and LT2 pace are too close. Focus on improving your LT2 pace.</p>';
        }
    }
});

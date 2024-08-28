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
                pointBackgroundColor: ['#2196f3', '#4caf50', '#ff9800', '#d32f2f'], // Colors for the points
                pointBorderColor: '#ffffff',
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
                    display: true, // Display labels on the points
                    align: 'end',
                    anchor: 'start',
                    offset: -30,
                    color: '#333',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
                        const labels = ['S&C', 'LT1', 'LT2', 'VO2'];
                        return labels[context.dataIndex]; // Custom labels for each point
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Add this line to register the datalabels plugin
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

        if (slider && input) {
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
        } else {
            console.error(`Element with ID '${sliderId}' or '${inputId}' not found`);
        }
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
        if (resultsSummary) {
            resultsSummary.innerHTML = '';

            const vo2Lt2Diff = Math.abs(vo2Pace - lt2Pace);
            const lt1Lt2Diff = Math.abs(lt1Pace - lt2Pace);

            // Display advice based on conditions
            if (vo2Lt2Diff <= 60) { // Threshold of 60 seconds (adjust as needed)
                resultsSummary.innerHTML = '<p class="advice">Your VO2 Max pace and LT2 pace are too close. Focus on improving your VO2 Max.</p>';
            } else if (lt1Lt2Diff <= 60) { // Threshold of 60 seconds (adjust as needed)
                resultsSummary.innerHTML = '<p class="advice">Your LT1 pace and LT2 pace are too close. Focus on improving your LT2 pace.</p>';
            }
        } else {
            console.error('Element with ID "results-summary" not found');
        }
    }

    // Function to parse time input to seconds
    function parseTimeToSeconds(timeStr) {
        const parts = timeStr.split(':').map(Number);
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }

    // Function to estimate paces based on race distance and time
    function estimatePaces(raceDistance, raceTimeInSeconds) {
        let vo2Pace, lt1Pace, lt2Pace;
        switch(raceDistance) {
            case '5k':
                vo2Pace = raceTimeInSeconds / 5;
                lt2Pace = vo2Pace + 15;
                lt1Pace = lt2Pace + 30;
                break;
            case '10k':
                vo2Pace = (raceTimeInSeconds / 10) * 0.95;
                lt2Pace = vo2Pace + 20;
                lt1Pace = lt2Pace + 35;
                break;
            case 'half':
                vo2Pace = (raceTimeInSeconds / 21.097) * 0.9;
                lt2Pace = vo2Pace + 30;
                lt1Pace = lt2Pace + 45;
                break;
            case 'full':
                vo2Pace = (raceTimeInSeconds / 42.195) * 0.85;
                lt2Pace = vo2Pace + 40;
                lt1Pace = lt2Pace + 60;
                break;
            default:
                console.error('Unknown race distance');
                return { vo2Pace: 0, lt1Pace: 0, lt2Pace: 0 };
        }
        return { vo2Pace, lt1Pace, lt2Pace };
    }

    // Event listener for calculate-paces button
    const calculatePacesButton = document.getElementById('calculate-paces');
    if (calculatePacesButton) {
        calculatePacesButton.addEventListener('click', function() {
            const raceDistance = document.querySelector('input[name="distance"]:checked')?.value;
            const raceTimeStr = document.getElementById('race-time')?.value;
            const raceTimeInSeconds = parseTimeToSeconds(raceTimeStr);

            if (raceDistance && raceTimeInSeconds) {
                // Calculate estimated paces
                const { vo2Pace, lt1Pace, lt2Pace } = estimatePaces(raceDistance, raceTimeInSeconds);

                // Display the estimated paces
                document.getElementById('vo2-estimate').innerText = secondsToPace(vo2Pace);
                document.getElementById('lt1-estimate').innerText = secondsToPace(lt1Pace);
                document.getElementById('lt2-estimate').innerText = secondsToPace(lt2Pace);
            } else {
                console.error('Race distance or time is missing');
            }
        });
    } else {
        console.error('Element with ID "calculate-paces" not found');
    }

    // Event listener for race-time input field validation
    const raceTimeInput = document.getElementById('race-time');
    const raceTimeError = document.getElementById('race-time-error');

    if (raceTimeInput && raceTimeError) {
        raceTimeInput.addEventListener('input', function (e) {
            const input = e.target.value;
            const regex = /^\d{2}:\d{2}:\d{2}$/; // Match hh:mm:ss format
            if (!regex.test(input)) {
                raceTimeError.textContent = 'Please enter a valid time in hh:mm:ss format.';
                raceTimeError.style.display = 'block';
            } else {
                const [hours, minutes, seconds] = input.split(':').map(Number);
                if (minutes >= 60 || seconds >= 60) {
                    raceTimeError.textContent = 'Minutes and seconds must be less than 60.';
                    raceTimeError.style.display = 'block';
                } else {
                    raceTimeError.style.display = 'none'; // Hide error
                }
            }
        });
    } else {
        console.error('race-time or race-time-error element not found');
    }
});

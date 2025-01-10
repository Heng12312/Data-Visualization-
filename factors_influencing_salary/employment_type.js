// employment_type.js

export const employment_type = (data) => {
    // Group data by employment_type and calculate mean salary
    const nestedData = d3.group(data, d => d.employment_type);
    
    const meanSalaries = Array.from(nestedData, ([key, value]) => {
        return {
            employment_type: mapEmploymentType(key), // Map abbreviation to full name
            mean_salary: d3.mean(value, d => d.salary_in_usd)
        };
    });

    // Call function to clear point chart
    clearPointChart();
    // Call function to create point chart
    createPointChart(meanSalaries);
};

function createPointChart(data) {
    d3.select("#treemap-container").html("");
    const svg = d3.select('svg'); // Select the SVG element or create a new one

    const margin = { top: 150, right: 100, bottom: 50, left: 80 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .domain(data.map(d => d.employment_type))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.mean_salary)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Append or select the group for chart content
    let chartGroup = svg.select('g.chart-group');
    if (chartGroup.empty()) {
        chartGroup = svg.append('g')
            .attr('class', 'chart-group')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    }

    // Clear previous points
    chartGroup.selectAll('.point').remove();

    // Create tooltip div
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute');

    // Draw points
    const points = chartGroup.selectAll('.point')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d.employment_type) + x.bandwidth() / 2)
        .attr('cy', d => y(d.mean_salary))
        .attr('r', 8) // Increase the size of the point dots
        .attr('fill', '#69b3a2')
        .attr('stroke', 'black')
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Employment Type: ${d.employment_type}<br>Mean Salary: $${d.mean_salary.toFixed(2)}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 35) + 'px'); // Adjust to show above the mouse
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // X-axis
    chartGroup.select('.x-axis').remove(); // Remove previous axis to avoid duplication
    chartGroup.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '2em') // Adjust label position if rotated
        .attr('dy', '0.30em'); // Adjust label position if rotated

    // Y-axis
    chartGroup.select('.y-axis').remove(); // Remove previous axis to avoid duplication
    chartGroup.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(null, 's'));

    // Title (if not already present)
    svg.select('.chart-title').remove(); // Remove previous title if exists
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .text('Mean Salary by Employment Type');

    // X-axis label (if not already present)
    svg.select('.x-axis-label').remove(); // Remove previous label if exists
    svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width - margin.right - 400) // Adjusted x position to move right
        .attr('y', height + margin.top - 10) // Adjusted y position for clarity
        .attr('text-anchor', 'end') // Align text to end (right)
        .style('font-size', '18px')
        .attr('fill', 'white')
        .text('Employment Type');

    // Y-axis label (if not already present)
    svg.select('.y-axis-label').remove(); // Remove previous label if exists
    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 1.15)
        .attr('y', margin.left + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .attr('fill', 'white')
        .text('Salary');
}

function clearPointChart() {
    // Clear previous point chart
    const svg = d3.select('svg');
    svg.selectAll('.chart-group').remove(); // Remove the entire chart group
    svg.selectAll('.chart-title').remove(); // Remove title
    svg.selectAll('.x-axis-label').remove(); // Remove x-axis label
    svg.selectAll('.y-axis-label').remove(); // Remove y-axis label
}

// Helper function to map abbreviation to full name
function mapEmploymentType(type) {
    switch (type) {
        case 'PT':
            return 'Part-time';
        case 'FT':
            return 'Full-time';
        case 'CT':
            return 'Contract';
        case 'FL':
            return 'Freelance';
        default:
            return type;
    }
}

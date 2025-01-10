import { company_location } from './company_location.js';
import { employee_residence } from './employee_residence.js';
import { company_size } from './company_size.js';
import { employment_type } from './employment_type.js';

// Constants
const svg = d3.select('svg')
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = { top: 50, right: 0, bottom: 20, left: 20 };
const inner_width = width - margin.left - margin.right;
const inner_height = height - margin.top - margin.bottom;
const button_width = 300;
const button_height = 50;
const button_margin = 10;
const button_data = [
    { label: 'Introduction', x: 0, y: 0, link: '../introduction/main.html' },
    { label: 'Top 10 Data Science Jobs', x: button_width + button_margin, y: 0, link: '../top_10_data_science_jobs/main.html' },
    { label: 'Factors Influencing Salary', x: (button_width + button_margin) * 2, y: 0, link: '../factors_influencing_salary/main.html' },
];

// Chart titles and descriptions for each factor
const chartTitles = {
    'company_location': 'Top 10 Company Locations by Salary Shown in Treemap',
    'employee_residence': 'Top 10 Employee Residence by Salary Shown in Circular Barplot',
    'company_size': 'Bar Chart for Company Size by Salary',
    'employment_type': 'Point Chart for Employment Type by Salary'
};

const chartDescriptions = {
    'company_location': 'Qatar is an excellent place for my second home!',
    'employee_residence': 'Rich Colleagues are staying in Israel.',
    'company_size': 'A medium-sized company seems to be a good place to explore.',
    'employment_type': 'Get a full-time stable data science job !'
};

// Modify the following constants for different pages
const subtitle = 'Factors Influencing Salary';
const defaultChartDescription = chartDescriptions['company_location'];
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "5px")
    .style("font-weight", "bold");

// Render function
const render = data => {
    // Title
    const title = svg.append('text')
        .attr('x', inner_width / 2)
        .attr('y', margin.top)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '32px')
        .attr('font-weight', 'bold')
        .text('Everything You Must Know about Data Science Jobs in the Early 2020s');

    // Buttons
    const buttons = svg.append('g')
        .attr('transform', `translate(${(inner_width - (button_width * 3 + button_margin * 2)) / 2}, ${margin.top + 30})`);
    button_data.forEach(d => {
        const button = buttons.append('g')
            .attr('class', 'button')
            .style('cursor', 'pointer')
            .on('click', () => {
                window.location.href = d.link;
            });
        
        button.append('rect')
            .attr('x', d.x)
            .attr('y', d.y)
            .attr('width', button_width)
            .attr('height', button_height)
            .attr('rx', 10)
            .attr('ry', 10)
            .style('fill', 'yellow')
            .style('stroke', 'black')
            .style('stroke-width', 2)
            .style('cursor', 'pointer');
        button.append('text')
            .attr('x', d.x + button_width / 2)
            .attr('y', d.y + button_height / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('fill', 'black')
            .style('pointer-events', 'none')
            .text(d.label);
    });
    
    // Chart
    const chart = svg.append('g')
        .attr('transform', `translate(${inner_width - 1080}, ${margin.top + 130})`);
    
    // Subtitle
    chart.append('text')
        .attr('x', -65)
        .attr('y', 0)
        .attr('fill', 'white')
        .attr('font-size', '24px')
        .attr('text-decoration', 'underline')
        .text(subtitle);
    
    // Chart Title
    const chartTitle = chart.append('text')
        .attr('x', inner_width - 1180)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '24px')
        .text(chartTitles['company_location']); // Default title

    // Drop-down menu
    const factors = ['Company Location', 'Employee Residence', 'Company Size', 'Employment Type'];
    const dropdownContainer = chart.append('foreignObject')
        .attr('x', 300)
        .attr('y', 30)
        .attr('width', 500)
        .attr('height', 100)
        .append('xhtml:div')
        .style('font-size', '18px')
        .style('color', 'black');

    dropdownContainer.append('label')
        .attr('for', 'factor-select')
        .style('color', 'white')
        .text('Factor: ');

    const select = dropdownContainer.append('select')
        .attr('id', 'factor-select')
        .style('width', '150px')
        .style('height', '40px')
        .style('background-color', '#EBD2EC');

    select.selectAll('option')
        .data(factors)
        .enter()
        .append('option')
        .attr('value', d => d.toLowerCase().replace(/\s+/g, '_'))
        .text(d => d);

    // Append treemap container
    chart.append('g')
        .attr('id', 'treemap-container')
        .attr('transform', `translate(0, 0)`);

    // Chart Description
    const chartDescription = chart.append('foreignObject')
        .attr('x', 0)
        .attr('y', 500)
        .attr('width', inner_width)
        .attr('height', 200) // Adjust height as needed
        .append('xhtml:div')
        .style('color', 'white')
        .style('font-size', '18px')
        .html(defaultChartDescription); // Default description

    // Event listener for dropdown menu change
    document.getElementById('factor-select').addEventListener('change', function() {
        const selectedFactor = this.value;
        chartTitle.text(chartTitles[selectedFactor]); // Update chart title
        chartDescription.html(chartDescriptions[selectedFactor]); // Update chart description
        if (selectedFactor === 'company_location') {
            company_location(data);
        } else if (selectedFactor === 'employee_residence') {
            employee_residence(data);
        } else if (selectedFactor === 'company_size') {
            company_size(data); // Pass data to company_size.js
        } else if (selectedFactor === 'employment_type') {
            employment_type(data);
        } else {
            d3.select('#treemap-container').html('<p>Content for ' + selectedFactor + ' will be here.</p>');
        }
    });
    
    // Call initial function (e.g., company_location) based on default selection
    company_location(data);
};

// Load data
d3.csv('../salaries.csv', d3.autoType).then(data => {
    // Calculate mean salary
    const meanSalary = d3.mean(data, d => d.salary_in_usd);

    // Log the mean salary to console
    console.log('Mean Salary:', meanSalary);
    render(data);
});

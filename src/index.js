//import * as d3 from 'd3';
import {
	selectAll,
	select,
	selection,
	html} from 'd3-selection';
import {timeParse} from 'd3-time-format';
import {scaleLinear,scaleQuantile} from 'd3-scale';
import {range,extent,max} from 'd3-array';
import {axisBottom,axisLeft} from 'd3-axis';
import {transition} from 'd3-transition';
import {format} from 'd3-format';
require('./index.css');

const url='https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
getData(url)

function getData(url){
	fetch(url)
	.then(response=>response.json())
	.then(data=>{
		//console.log(data)
		drawGraph(data)
	})
}
function drawGraph(data){
	//variable holding svg attributes
	const margin ={top:100,bottom:100,left:70,right:50}
	const width = 950;
	const height = 550;
	const innerHeight = height - margin.top - margin.bottom;
	const innerWidth = width - margin.left - margin.right;

	//creates svg
	let svg = select('body')
		.append('svg')
		.attr('width',width)
		.attr('height',height)
		.attr('class','graph');

	let g = svg.append('g')
		.attr('transform','translate('
			+ margin.left + ',' + margin.top + ')');

	//set grid width and height
	const dataLength = data.monthlyVariance.length -1;
	const years = data.monthlyVariance[dataLength].year - data.monthlyVariance[0].year;
	const gridWidth = innerWidth/years
	const gridHeight = innerHeight/(12-1)

	//set ranges
	let xScale = scaleLinear()
		.range([0,innerWidth]);

	let yScale = scaleLinear()
		.range([innerHeight-gridHeight,0]);
	
	//set domain
	xScale.domain(extent(data.monthlyVariance,d=>{return d.year}))
	const yDomain = extent(data.monthlyVariance,d=>{return d.month})
	yScale.domain(swap(yDomain))

	//console.log(xScale.domain(),yScale.domain()) 

	const color = ['purple','blue','green','#b2b266','#ffffb2','#ffffcc',
					'#ffd27f','#ffae19','#ff4c4c','#ff0000','#990000']
	const month =['January','February','March','April','May',
						'June','July','August','September','October',
						'November','December']
	//console.log(gridWidth,gridHeight)
	
	//color scale
	const variance = extent(data.monthlyVariance,d=>{return d.variance})
	//console.log(variance)
	const colorScale = scaleQuantile()
		.domain(variance)
		.range(color)

	//console.log(colorScale.domain(),colorScale.range())
	//console.log(colorScale.quantiles())
	//shows data on mousehover
	let div = select('body').append('div')
		.attr('class','tooltip')
		.style('opacity',0);

	g.selectAll('.correlation')
		.data(data.monthlyVariance)
		.enter().append('rect')
			.attr('class','correlation')
			.attr('x',function(d){return xScale(d.year)})
			.attr('y',function(d){return yScale(d.month)})
			.attr('width', gridWidth)
			.attr('height', gridHeight)
			.style('fill',function(d){return colorScale(d.variance)})
			.on('mouseover',function(d){
				div.transition()
					.duration(100)
					.style('opacity',.9)
				div.html(d.year + ' ' + month[d.month-1] + '</br>' 
					+ 'T: ' + (data.baseTemperature + d.variance).toFixed(4) +' C'
				 	+ '</br>' +'V: ' + d.variance + ' C')
					.style('left',(event.pageX -50)+'px')
					.style('top',(event.pageY-100)+'px')
				
			})
			.on('mouseout',function(d){
				div.transition()
					.duration(100)
					.style('opacity',0)
			})

	//add x and y axis
	g.append('g')
		.attr('class','x-axis')
		.attr('transform','translate(0,'+ innerHeight +')')
		.call(
			axisBottom(xScale)
				.tickFormat(format("d"))
			);
	
	g.append('g')
		.attr('class','y-axis')
		.attr('transform','translate(0,'+ gridHeight/2 +')')
		.call(
			axisLeft(yScale)
				.tickSize(0)
				.tickFormat(function(d){return month[d-1]})
			)

	getDescription(svg,innerHeight,innerWidth,height)
	addLegend(svg,color,colorScale,data)
}
function swap(x){
	let temp = x[0];
	x[0] = x[1];
	x[1] = temp;
	return x
}
function getDescription(svg,innerHeight,innerWidth,height){
	//console.log(innerHeight,height)
	svg.append('text')
		.attr('class','title')
		.attr('x','30%')
		.attr('y','10%')
		.text('Monthly Global Land-Surface Temperature')
	svg.append('text')
		.attr('class','yAxis-des')
		.attr('transform','translate(20,'+ (innerHeight-100) +') rotate(-90)')
		.text('Ranking')
	svg.append('text')
		.attr('class','xAxis-des')
		.attr('transform','translate('+(innerWidth/2 +50) + ','+ (height-50) +')')
		.text('Years')

}
function addLegend(svg,color,colorScale,data){
	let legendText = colorScale.quantiles().map(d=>(d += data.baseTemperature).toFixed(1))
	legendText = [0].concat(legendText)
	
	let legend = svg.append('g')
		.attr('class','legend')
	let j =550;
	for(let i = 0; i < color.length; i++){
		//console.log(j)
		legend.append('rect')
			.attr('width',35)
			.attr('height',15)
			.style('fill',color[i])
			.attr('transform','translate('+ j + ',510)' )
		legend.append('text')
			.attr('class','legendText')
			.attr('transform','translate('+ j + ',540)' )
			.text(legendText[i])
		j+=35;
	}
}

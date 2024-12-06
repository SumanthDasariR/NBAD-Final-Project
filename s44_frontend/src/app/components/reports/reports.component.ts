import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  items: any[] = [];
  error: string = '';
  loading: boolean = true;
  chartConfigs: { [key: string]: ChartConfiguration } = {};

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getReportsData().subscribe(
      response => {
        console.log('API Response:', response); // Debug log
        this.items = response.items;
        this.loading = false;
        this.prepareChartConfigs();
      },
      error => {
        this.error = 'Failed to fetch data';
        console.error('Error fetching Reports data', error);
        this.loading = false;
      }
    );
  }

  prepareChartConfigs(): void {
    this.items.forEach(item => {
      if (item.type === 'chart') {
        try {
          const chartData = JSON.parse(item.data.chart_data);
          const chartConfig = chartData.chart;
          this.chartConfigs[item.data.id] = this.getChartConfig(chartConfig);
        } catch (error) {
          console.error('Error preparing chart config:', error);
        }
      }
    });
  }

  getChartConfig(config: any): ChartConfiguration {
    const chartConfig: ChartConfiguration = {
      type: config.type as ChartType,
      data: {
        labels: config.series[0].labels,
        datasets: [{
          label: config.series[0].name,
          data: config.series[0].data,
          backgroundColor: config.colors,
          borderColor: config.colors,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true,
            max: config.yScale?.maximum
          }
        },
        plugins: {
          title: {
            display: true,
            text: config.title
          },
          subtitle: {
            display: true,
            text: config.caption
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw}`
            }
          }
        }
      }
    };
    return chartConfig;
  }

  renderContent(content: any): string {
    return DOMPurify.sanitize(content.data.html_content);
  }
}
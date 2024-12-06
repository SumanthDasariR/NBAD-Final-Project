import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';




interface ContentItem {
  _id: string;
  page_type: string;
  order_id: number;
  html_content: string;
}

interface ChartItem {
  _id: string;
  page_type: string;
  chart_type: string;
  order_id: number;
  chart_data: string;
}


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxEditorModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  editor: Editor = new Editor();
  html = '';

  private _pageType: string = 'dashboard';
  get pageType(): string {
    return this._pageType;
  }
  set pageType(value: string) {
    this._pageType = value;
    this.loadContentAndCharts();
  }

  editorState = '';
  orderId = 1;
  chartType: keyof typeof this.sampleChartData = 'bar';
  chartData = '';
  contents: ContentItem[] = [];
  charts: ChartItem[] = [];
  editMode: 'content' | 'chart' | false = false;
  editId: string | null = null;
  pageTypes = ['dashboard', 'summary', 'reports'];
  chartTypes = ['bar', 'line', 'pie'];
  sampleChartData = {
    bar: JSON.stringify({
      chart: {
        type: 'bar',
        series: [{
          data: [65, 59, 80, 81, 56],
          name: 'AI Models Released',
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
        }],
        yScale: {
          minimum: 0,
          maximum: 100
        },
        title: 'Monthly AI Model Releases',
        colors: ['#4CAF50'],
        caption: 'This bar chart shows the number of AI models released each month, highlighting the trends over a 5-month period.'
      }
    }, null, 2),
    line: JSON.stringify({
      chart: {
        type: 'line',
        series: [{
          data: [28, 48, 40, 19, 86],
          name: 'Performance Improvements',
          labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct']
        }],
        yScale: {
          minimum: 0,
          maximum: 100
        },
        title: 'AI Model Performance Trends',
        colors: ['#2196F3'],
        caption: 'This line chart illustrates the performance improvements of AI models from June to October, showcasing significant fluctuations.'
      }
    }, null, 2),
    pie: JSON.stringify({
      chart: {
        type: 'pie',
        series: [{
          data: [
            { name: 'Language Models', value: 45 },
            { name: 'Vision Models', value: 25 },
            { name: 'Multimodal Models', value: 30 }
          ]
        }],
        title: 'AI Model Types Distribution',
        colors: ['#FF9800', '#9C27B0', '#E91E63'],
        caption: 'This pie chart shows the distribution of AI models by type, with the largest portion dedicated to Language Models.'
      }
    }, null, 2)
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.loadContentAndCharts();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  loadContentAndCharts(): void {
    // Fetch content and charts based on the current pageType
    this.apiService.getAdminContents(this.pageType).subscribe(
      (contents: ContentItem[]) => {
        this.contents = contents;
      },
      error => {
        console.error('Error fetching content', error);
      }
    );

    this.apiService.getAdminCharts(this.pageType).subscribe(
      (charts: ChartItem[]) => {
        this.charts = charts;
      },
      error => {
        console.error('Error fetching charts', error);
      }
    );
  }

  fetchData(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastr.error('Not authorized. Please login again.');
      this.toastService.error('Not authorized. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.apiService.getAdminContents(this.pageType).subscribe(
      (contentsRes) => {
        this.contents = contentsRes;
      },
      (error) => {
        this.handleError(error);
      }
    );

    this.apiService.getAdminCharts(this.pageType).subscribe(
      (chartsRes) => {
        this.charts = chartsRes;
      },
      (error) => {
        this.handleError(error);
      }
    );
  }

  handleSubmitContent(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastService.error('Not authorized. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    const data = {
      page_type: this.pageType,
      content: this.editorState,
      order_id: this.orderId
    };

    if (this.editMode === 'content') {
      this.apiService.updateContent(this.editId!, data).subscribe(
        () => {
          this.toastService.success('Content updated successfully!');
          this.resetForm();
          this.fetchData();
        },
        (error) => {
          this.handleError(error);
        }
      );
    } else {
      this.apiService.addContent(data).subscribe(
        () => {
          this.toastService.success('Content added successfully!');
          this.resetForm();
          this.fetchData();
        },
        (error) => {
          this.handleError(error);
        }
      );
    }
  }

  handleSubmitChart(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastService.error('Not authorized. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    const data = {
      page_type: this.pageType,
      chart_type: this.chartType,
      chart_data: JSON.parse(this.chartData),
      order_id: this.orderId
    };

    if (this.editMode === 'chart') {
      this.apiService.updateChart(this.editId!, data).subscribe(
        () => {
          this.toastService.success('Chart updated successfully!');
          this.resetForm();
          this.fetchData();
        },
        (error) => {
          this.handleError(error);
        }
      );
    } else {
      this.apiService.addChart(data).subscribe(
        () => {
          this.toastService.success('Chart added successfully!');
          this.resetForm();
          this.fetchData();
        },
        (error) => {
          this.handleError(error);
        }
      );
    }
  }

  handleDelete(id: string, type: string): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastService.error('Not authorized. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.apiService.deleteItem(id, type).subscribe(
      () => {
        this.toastService.success('Deleted successfully!');
        this.fetchData();
      },
      (error) => {
        this.handleError(error);
      }
    );
  }

  handleEditContent(item: ContentItem): void {
    this.editMode = 'content';
    this.editId = item._id;
    this.pageType = item.page_type;
    this.orderId = item.order_id;
    this.editorState = item.html_content;
  }

  handleEditChart(item: ChartItem): void {
    this.editMode = 'chart';
    this.editId = item._id;
    this.pageType = item.page_type;
    this.orderId = item.order_id;
    this.chartType = item.chart_type as 'bar' | 'line' | 'pie';
    this.chartData = item.chart_data;
  }

  resetForm(): void {
    this.editMode = false;
    this.editId = null;
    this.editorState = '';
    this.chartData = '';
    this.orderId = 1;
  }

  handleError(error: any): void {
    if (error.status === 401) {
      this.toastService.error('Session expired. Please login again.');
      this.router.navigate(['/login']);
    } else {
      this.toastService.error('Operation failed.');
      console.error('Error:', error);
    }
  }

  handleChartTypeChange(event: any): void {
    this.chartType = event.target.value;
    this.chartData = this.sampleChartData[this.chartType];
  }
}
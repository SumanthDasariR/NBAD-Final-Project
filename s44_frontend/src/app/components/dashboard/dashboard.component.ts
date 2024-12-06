import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  data: any = null;
  error: string = '';
  loading: boolean = true;

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getDashboardData().subscribe(
      (response) => {
        this.data = response;
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to fetch data';
        this.toastService.error('Failed to fetch data');
        console.error('Error fetching dashboard data', error);
        this.loading = false;
      }
    );
  }

  renderContent(content: any): string {
    return content.html_content;
  }
}
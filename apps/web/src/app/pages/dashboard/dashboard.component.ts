import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private pb = new PocketBase('http://127.0.0.1:80');
  private router = inject(Router);

  user: any = null;

  ngOnInit() {
    if (!this.pb.authStore.isValid) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = this.pb.authStore.model;
  }

  logout() {
    this.pb.authStore.clear();
    this.router.navigate(['/login']);
  }
}

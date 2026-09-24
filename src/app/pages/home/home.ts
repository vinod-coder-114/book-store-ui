import { Component, inject, signal, computed } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminBook } from '../admin/admin.model';
import { BookCardComponent } from '../../shared/components/book/book';

@Component({
  imports: [BookCardComponent],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private adminService: AdminService = inject(AdminService);

  /*
   * Get books from backend.
   *
   * Since your application is already using
   * signals successfully, toSignal() is a good
   * fit here.
   */
  readonly allBooks = toSignal(this.adminService.getBooksInformation(), {
    initialValue: [] as AdminBook[],
  });

  /*
   * Display only a few books on Home page.
   *
   * Your /book page will continue to display
   * the complete catalog.
   */
  readonly featuredBooks = computed(() => this.allBooks().slice(0, 4));

  readonly categories = [
  {
    name: 'Fiction',
    icon: 'bi-book'
  },
  {
    name: 'Non-Fiction',
    icon: 'bi-lightbulb'
  },
  {
    name: 'Self Help',
    icon: 'bi-leaf'
  },
  {
    name: 'Business',
    icon: 'bi-bar-chart-line'
  },
  {
    name: 'Technology',
    icon: 'bi-laptop'
  },
  {
    name: 'Children',
    icon: 'bi-emoji-smile'
  },
  {
    name: 'Comics',
    icon: 'bi-images'
  },
  {
    name: 'Academic',
    icon: 'bi-mortarboard'
  },
  {
      name: 'Business',
      icon: 'bi-briefcase'
  },
  {
    name: 'Artificial Intelligence',
    icon: 'bi-cpu'
  },

];

  readonly catagoriesSignal = signal(this.categories);
}

import { Component } from '@angular/core';
import { BookCardComponent } from '../../shared/components/book/book';

type CatalogBook = {
  id: number;
  title: string;
  author: string;
  frontImage: string;
  backImage: string;
  price: number;
  originalPrice: number;
  genre: string;
  format: string;
  rating: number;
};

@Component({
  imports: [BookCardComponent],
  selector: 'app-catalog',
  styleUrl: './catalog.css',
  templateUrl: './catalog.html',
})
export class Catalog {
  protected readonly books: CatalogBook[] = [];
}

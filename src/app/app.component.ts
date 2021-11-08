import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

interface Movie {
  nome: string;
  ano: string;
  diretor: string;
  genero: string;
  generos: string[];
  descricao: string;
  poster: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly URL = `assets/json/FILMES.JSON`;

  queryField = new FormControl();

  movies$!: Observable<Movie[]>;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.movies$ = this.listMovies();

    this.queryField.valueChanges
      .pipe(
        map((value) => value.trim()),
        filter((value) => value.length > 1),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((res) => (this.movies$ = this.searchMovies(res)));
  }

  listMovies = () =>
    this.httpClient.get<Movie[]>(this.URL).pipe(
      map((movies: Movie[]) =>
        movies.map((movie: Movie) => {
          movie.generos = movie.genero.split('/');
          return movie;
        })
      )
    );

  searchMovies = (search: string) =>
    this.listMovies().pipe(
      map((movies: Movie[]) =>
        search.length > 2
          ? movies.filter((movie: Movie) =>
              movie.nome
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase())
            )
          : movies
      )
    );
}

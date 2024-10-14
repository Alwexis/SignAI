import { Routes } from '@angular/router';
import { HomePage } from './views/home/home.component';
import { TextoComponent } from './views/texto/texto.component';


export const routes: Routes = [
    {
        path: 'home',
        component: HomePage

    },
    {
        path: 'texto',
        component: TextoComponent
    }
];

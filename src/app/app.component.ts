import { Component, OnInit } from '@angular/core';

@Component({
  selector: `app-root-main`,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'web';
  theme = 'theme';

  ngOnInit(): void {
    console.log("PIXAUTOMATICO-FRONTEND");
  }
  
}

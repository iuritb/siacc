import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
// Angular Material
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// SIDSC Components
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscTooltipModule } from 'sidsc-components/dsc-tooltip';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscInputCurrencyComponent } from 'sidsc-components/dsc-input-currency';
import { DscInputFileComponent } from 'sidsc-components/dsc-input-file';
import { DscCheckboxComponent } from 'sidsc-components/dsc-checkbox';
import { DscRadioButtonComponent } from 'sidsc-components/dsc-radio-button';
import { DscTableComponent } from 'sidsc-components/dsc-table';
import { DscTextareaComponent } from 'sidsc-components/dsc-textarea';
import { DscTabGroupComponent, DscTabComponent } from 'sidsc-components/dsc-tab-group';
import { DscBreadcrumbComponent } from 'sidsc-components/dsc-breadcrumb';
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { DscProgressSpinnerComponent } from 'sidsc-components/dsc-progress-spinner';
import { DscProgressBarComponent } from 'sidsc-components/dsc-progress-bar';
import { DscPaginatorComponent } from 'sidsc-components/dsc-paginator';
import { DscSwitchComponent } from 'sidsc-components/dsc-switch';
import { DscSelectComponent } from 'sidsc-components/dsc-select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DscSnackbarModule } from 'sidsc-components/dsc-snackbar';
import { NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap';
import { DscAccordionComponent } from 'sidsc-components/dsc-accordion';
import { DscStepperComponent } from 'sidsc-components/dsc-stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Angular Material
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatRadioModule,

    // NG Bootstrap
    NgbOffcanvasModule,

    // SIDSC Components
    DscButtonComponent,
    DscTooltipModule,
    DscInputComponent,
    DscInputCurrencyComponent,
    DscInputFileComponent,
    DscCheckboxComponent,
    DscRadioButtonComponent,
    DscSelectComponent,
    DscTableComponent,
    DscTextareaComponent,
    DscTabGroupComponent,
    DscTabComponent,
    DscBreadcrumbComponent,
    DscAlertComponent,
    DscProgressSpinnerComponent,
    DscProgressBarComponent,
    DscPaginatorComponent,
    DscSwitchComponent,
    DscAccordionComponent,
    DscStepperComponent,
    DscSnackbarModule,
    DscInputCurrencyComponent,
    DscStepperComponent
  ],
  exports: [
    // Angular base
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NoopAnimationsModule,
    RouterTestingModule,

    // Angular Material
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatRadioModule,

    // SIDSC Components
    DscButtonComponent,
    DscTooltipModule,
    DscInputComponent,
    DscInputCurrencyComponent,
    DscInputFileComponent,
    DscCheckboxComponent,
    DscRadioButtonComponent,
    DscSelectComponent,
    DscTableComponent,
    DscTextareaComponent,
    DscTabGroupComponent,
    DscTabComponent,
    DscBreadcrumbComponent,
    DscAlertComponent,
    DscProgressSpinnerComponent,
    DscProgressBarComponent,
    DscPaginatorComponent,
    DscSwitchComponent,
    DscSnackbarModule,
    DscAccordionComponent,
    DscStepperComponent
  ]
})
export class SharedModule { }

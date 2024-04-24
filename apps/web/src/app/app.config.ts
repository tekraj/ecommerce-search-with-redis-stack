import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

// import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
// import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
// import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
// import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
// import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
// import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
// import { MdbPopoverModule } from 'mdb-angular-ui-kit/popover';
// import { MdbRadioModule } from 'mdb-angular-ui-kit/radio';
// import { MdbRangeModule } from 'mdb-angular-ui-kit/range';
// import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
// import { MdbScrollspyModule } from 'mdb-angular-ui-kit/scrollspy';
// import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
// import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
// import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(HttpClientModule)],
};

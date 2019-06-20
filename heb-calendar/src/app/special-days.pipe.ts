import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'specialDays'
})
export class SpecialDaysPipe implements PipeTransform {

  transform(value: any[], show: boolean): any {
    if (show) {
      return value.filter(f => f.className == 'parashat' || f.className == 'additional' || f.className.indexOf('yomtov') >= 0);
    }
    return value;

  }

 

}

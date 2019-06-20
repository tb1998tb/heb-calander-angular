import { Component, ViewChild } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { HttpClient } from '@angular/common/http';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'heb-calander';
  calendarPlugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]; // important!
  @ViewChild('calendar', { static: false }) fullCalendar: FullCalendarComponent;
  hebCalEvents;
  calendarApi: Calendar;
  showSpecial = false;
  allEvents;
  constructor(private http: HttpClient) {

  }

  ngAfterViewInit() {
    this.declareCalendar();

  }

  declareCalendar() {
    this.calendarApi = this.fullCalendar.getApi();
    this.calendarApi.setOption('locale', 'he')
    this.calendarApi.setOption('dir', 'rtl');
    this.getEvents();
    var prev = <any>document.getElementsByClassName('fc-prev-button')[0];
    var next = <any>document.getElementsByClassName('fc-next-button')[0];
    //var dateCards = <any>document.querySelectorAll('.fc-day:not(.fc-other-month)');

    //for (var i in dateCards) {
    //  dateCards[i].onclick = (data,elem) => {
    //    this.handleDateClick(data, elem);
    //  }
    //}

    prev.onclick = () => {
      this.getEvents();
    };
    next.onclick = () => {
      this.getEvents();
    };
  }

  getEvents() {
    var start = this.toFormatDate(this.calendarApi.view.currentStart, 'YYYY-MM-DD');
    var end = this.toFormatDate(this.calendarApi.view.currentEnd, 'YYYY-MM-DD');
    var url = `https://www.hebcal.com/hebcal/?cfg=fc&v=1&i=off&maj=on&min=on&nx=on&mf=on&ss=on&mod=on&lg=h&s=on
               &start='${start}'&end='${end}'`
    this.http.get(url)
      .subscribe((res: any) => {
        this.allEvents = res.map(m => {
          return {
            title: m.title,
            start: m.start,
            end: m.end,
            className: m.className,
            allDay: m.allDay
          }
        });
        this.hebCalEvents = this.allEvents;
        this.addDefaultEvents();
      });

  }

  addDefaultEvents() {
    if (this.hebCalEvents != null) {
      var additional = [];
      var index = 0;
      this.hebCalEvents = this.hebCalEvents.filter(f => f.className != 'additional');
      this.hebCalEvents.forEach((f) => {
        if (f.className == 'parashat') {
          f.title = f.title.replace('פרשת', 'שבת');
          additional.push({
            title: 'ערב ' + f.title,
            start: this.addDays(f.start, 'YYYY-MM-DD', -1),
            end: this.addDays(f.end, 'YYYY-MM-DD', -1),
            className: 'additional',
            allDay: f.allDay
          })
        }
        if (f.title.indexOf('ערב') == 0)
          f.className = 'holiday not yomtov';

        if (index > 0 && (this.hebCalEvents[index - 1].title.indexOf('ערב') == 0 || this.hebCalEvents[index - 1].className.indexOf('not yomtov') >= 0) && f.className == 'holiday') {
          f.className = 'holiday not yomtov';
        }
        index++;
      })
    };
    for (var i in additional) {
      this.hebCalEvents.push(additional[i]);
    }
    var startD = this.toFormatDate(moment().add(-1, 'days'), 'YYYY-MM-DD');
    var endD = this.toFormatDate(moment().add(5, 'days'), 'YYYY-MM-DD');
    var startH = this.toFormatDate(moment().add(-1, 'hours'), 'YYYY-MM-DD hh:mm');
    var endH = this.toFormatDate(moment().add(1, 'hours'), 'YYYY-MM-DD hh:mm');
    this.hebCalEvents.push({
      title: 'בדיקה - ימים מרובים',
      start: startD,
      end: endD,
      className:'check-date'
    });
    this.hebCalEvents.push({
      title: 'בדיקה - שעות מסוימות',
      start: startH,
      end: endH,
      className:'check-date'

    })
  };

  addDays(date, formatStr, numDays) {
    if (!date)
      return date;
    return moment(date, formatStr).add(numDays, 'days').format(formatStr);
  }

  toFormatDate(val, formatStr) {
    return moment(val).format(formatStr);
  }

  toDate(val, formatStr) {
    return moment(val, formatStr).toDate();

  }

  handleDateClick(info) {
    var events = [];
    var exists = false;
    for (var i = 0; i < this.hebCalEvents.length; i++) {
      var start = this.toDate(this.hebCalEvents[i].start, 'YYYY-MM-DD');
      var end = !this.hebCalEvents[i].end ? null : this.toDate(this.hebCalEvents[i].end, 'YYYY-MM-DD');
      var s = moment(start).diff(moment(info.date));
      var e = moment(end).diff(moment(info.date));
      if (moment(info.date).diff(moment(start)) == 0 || (end && (moment(info.date).diff(moment(start)) >= 0) && (moment(info.date).diff(moment(end)) < 0))) {
        events.push(this.hebCalEvents[i]);
        alert('ביום זה חל ' + this.hebCalEvents[i].title);
        exists = true;
      }
    }
    if (!exists) {
      alert('אין אירועים ביום זה');
    }
  }
}

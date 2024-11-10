import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameDay,
  startOfYear,
  endOfYear,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  eachMonthOfInterval
} from 'date-fns';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CalendarComponent {
  modalVisible: boolean = false; 
  showTimeSlots: boolean = false; 
  showMonthCalendar: boolean = true; 
  currentView: 'day' | 'week' | 'month' | 'year' = 'month';
  currentDate: Date;
  selectedYearMonth: Date | null = null; 
  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weeks: Date[][] = [];
    selectedEvent: any; 

  months: Date[] = [];
  years: number[] = [];
  events: { [key: string]: { time: string, title: string, description?: string, attachment?: File | null }[] } = {};
  selectedDate: Date | null = null;
  selectedTime: string = '';
  newEventTitle: string = '';
  newEventDescription: string = '';
  attachmentFile: File | null = null;
  editMode: boolean = false;
  editEventIndex: number | null = null;
  timeSlots: { time: string }[] = [
     { time: '01:00' }, { time: '02:00' }, { time: '03:00' },
     {time:'04:00'}, { time: '05:00' },
     { time: '06:00' }, { time: '07:00' } ,{ time: '08:00' }, 
     { time: '09:00' }, { time: '10:00' }, { time: '11:00' },
     { time: '12:00' }, { time: '13:00' }, { time: '14:00' }, { time: '15:00' },
     { time: '16:00' }, { time: '17:00' }, { time: '18:00' }, { time: '19:00' },
     { time: '20:00' }, { time: '21:00' }, { time: '22:00' }, { time: '23:00' },
      
  ];

  monthDays: Date[] = [];

  constructor() {
    this.currentDate = new Date(); 
    this.updateCalendar();
  }
  ngOnInit() {
    this.updateCalendar();
  }


prevYear(): void {
  this.currentDate = subMonths(this.currentDate, 12); 
  this.updateCalendar();
}
navigateToDayView(day: Date): void {
  this.selectedDate = day; 
  this.changeView('day');  
}


selectMonthInYearView(month: Date): void {
  this.selectedYearMonth = month;
  this.currentDate = new Date(this.currentDate.getFullYear(), month.getMonth(), 1);
}

 showEventDetails(event: any): void {
    this.selectedEvent = event;
  }

  hideEventDetails(): void {
    this.selectedEvent = null;
  }
  changeView(view: 'day' | 'week' | 'month' | 'year'): void {
    this.currentView = view;
    this.updateCalendar();
  }
  nextYear(): void{
    this.currentDate = addMonths(this.currentDate,12);
    this.updateCalendar();
  }

  changeToMonthView(): void {
    this.changeView('month');
  }

  selectMonth(month: Date): void {
    this.selectedYearMonth = month;
    this.currentDate = new Date(this.currentDate.getFullYear(), month.getMonth(), 1);
    this.changeView('month');
  }

  prev(): void {
    switch (this.currentView) {
      case 'month':
        this.currentDate = subMonths(this.currentDate, 1);
        break;
      case 'year':
        this.currentDate = subMonths(this.currentDate, 12);
        break;
      case 'week':
        this.currentDate = subWeeks(this.currentDate, 1);
        break;
      case 'day':
        this.currentDate = subDays(this.currentDate, 1);
        break;
    }
    this.updateCalendar();
  }

  next(): void {
    switch (this.currentView) {
      case 'month':
        this.currentDate = addMonths(this.currentDate, 1);
        break;
      case 'year':
        this.currentDate = addMonths(this.currentDate, 12);
        break;
      case 'week':
        this.currentDate = addWeeks(this.currentDate, 1);
        break;
      case 'day':
        this.currentDate = addDays(this.currentDate, 1);
        break;
    }
    this.updateCalendar();
  }

  private updateCalendar(): void {
    switch (this.currentView) {
      case 'month':
        this.updateMonthView();
        break;
      case 'week':
        this.updateWeekView();
        break;
      case 'year':
        this.updateYearView();
        break;
      case 'day':
        this.updateDayView();
        break;
    }
    this.updateTimeSlots();
  }

  private updateMonthView(): void {
    this.monthDays = this.eachMonthDays();
    const start = startOfMonth(this.currentDate);
    const end = endOfMonth(this.currentDate);

    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const endWeek = endOfWeek(end, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startWeek, end: endWeek });

    this.weeks = this.chunkDays(days, 7);
    this.months = [];
    this.years = [];
  }

  getDaysInMonth(month: Date): Date[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    let days: Date[] = [];
    let date = new Date(year, monthIndex, 1);
    
    while (date.getMonth() === monthIndex) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  }

  private updateWeekView(): void {
    const start = startOfWeek(this.currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(this.currentDate, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start, end });

    this.weeks = this.chunkDays(days, 7);
    this.months = [];
    this.years = [];
  }

  private updateYearView(): void {
    const start = startOfYear(this.currentDate);
    const end = endOfYear(this.currentDate);

    this.months = eachMonthOfInterval({ start, end });
    this.weeks = [];
    this.years = [];
  }

  private updateDayView(): void {
    this.weeks = [];
    this.months = [];
    this.years = [];
  }

  private chunkDays(days: Date[], size: number): Date[][] {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += size) {
      result.push(days.slice(i, i + size));
    }
    return result;
  }

  isToday(day: Date): boolean {
    return isToday(day);
  }

  isSelected(day: Date): boolean {
    return this.selectedDate ? isSameDay(day, this.selectedDate) : false;
  }

  getDayClass(day: Date): string {
    return `calendar-day ${this.isToday(day) ? 'today' : ''} ${this.isSelected(day) ? 'selected' : ''}`;
  }
   onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.attachmentFile = file; 
    }
  }
  saveEvent(): void {
    this.closeModal();
  }

  selectDate(day: Date): void {
  this.selectedDate = day;
  this.newEventTitle = '';
  this.newEventDescription = '';
  this.selectedTime = '';
  this.attachmentFile = null;
  this.editMode = false;
  this.editEventIndex = null;

  
  if (this.currentView === 'week' || this.currentView === 'day') {
    this.showTimeSlots = true;
  } else {
    this.showTimeSlots = false;
  }
}


  openEventModal(time: string): void {
    if (this.selectedDate) {
      this.selectedTime = time;
      this.newEventTitle = '';
      this.newEventDescription = '';
      this.attachmentFile = null;
      this.editMode = false;
      this.editEventIndex = null;
      this.modalVisible = true; 
    }
  }

  submitEvent(): void {
    this.addEvent();
  }

  addEvent(): void {
    if (this.selectedDate && this.newEventTitle.trim() && this.selectedTime.trim()) {
      const dateKey = format(this.selectedDate, 'yyyy-MM-dd');
      if (!this.events[dateKey]) {
        this.events[dateKey] = [];
      }
      const newEvent = {
        time: this.selectedTime,
        title: this.newEventTitle,
        description: this.newEventDescription,
        attachment: this.attachmentFile || undefined
      };
      if (this.editMode && this.editEventIndex !== null) {
        this.events[dateKey][this.editEventIndex] = newEvent;
      } else {
        this.events[dateKey].push(newEvent);
      }
      this.resetForm();
    }
  }

  editEvent(day: Date, index: number): void {
    this.selectedDate = day;
    const dateKey = format(day, 'yyyy-MM-dd');
    if (this.events[dateKey]) {
      this.newEventTitle = this.events[dateKey][index].title;
      this.selectedTime = this.events[dateKey][index].time;
      this.newEventDescription = this.events[dateKey][index].description || '';
      this.attachmentFile = this.events[dateKey][index].attachment || null;
      this.editMode = true;
      this.editEventIndex = index;
      this.modalVisible = true; 
    }
  }

  deleteEvent(day: Date, index: number): void {
    const dateKey = format(day, 'yyyy-MM-dd');
    if (this.events[dateKey]) {
      this.events[dateKey].splice(index, 1);
      if (this.events[dateKey].length === 0) {
        delete this.events[dateKey];
      }
    }
  }

  getEvents(day: Date): { time: string, title: string, description?: string, attachment?: File | null }[] {
    const dateKey = format(day, 'yyyy-MM-dd');
    return this.events[dateKey] || [];
  }

  getEventsByTime(day: Date, time: string): { time: string, title: string, description?: string, attachment?: File | null }[] {
    const dateKey = format(day, 'yyyy-MM-dd');
    return (this.events[dateKey] || []).filter(event => event.time === time);
  }

  closeModal(): void {
    this.resetForm();
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachmentFile = input.files[0];
    }
  }

  getAttachmentUrl(file: File | null): string {
    return file ? URL.createObjectURL(file) : '';
  }

  private resetForm(): void {
    this.selectedDate = null;
    this.selectedTime = '';
    this.newEventTitle = '';
    this.newEventDescription = '';
    this.attachmentFile = null;
    this.editMode = false;
    this.editEventIndex = null;
    this.modalVisible = false; 
  }

  private updateTimeSlots(): void {
    if (this.currentView === 'day') {
      this.showTimeSlots = true; 
    } else {
      this.showTimeSlots = false; 
    }
  }
  

  eachMonthDays(): Date[] {
    const start = startOfMonth(this.currentDate);
    const end = endOfMonth(this.currentDate);
    return eachDayOfInterval({ start, end });
  }
  

  eachWeekDays(): Date[] {
    const start = startOfWeek(this.currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(this.currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }
}

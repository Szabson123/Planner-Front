import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {
  transform(time: string): string {
    return time.slice(0, -3);
  }
}

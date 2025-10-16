import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { SHORT_DATE } from '../constants/global.constants';

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const newDateKeepLocalTime = (date?: Date | string): Date | null => {
  if (!date) return null;
  return dayjs(date).utc(true).toDate();
};

export function isBeforeDay(
  date: string | Date,
  value: string | Date,
): boolean {
  return dayjs(date).isBefore(dayjs(value), 'day');
}

export function isAfterDay(date: string | Date, value: string | Date): boolean {
  return dayjs(date).isAfter(dayjs(value), 'day');
}

export function isSameDay(date: string | Date, value: string | Date): boolean {
  return dayjs(date).isSame(dayjs(value), 'day');
}

export function isSameOrBeforeDay(
  date: string | Date,
  value: string | Date,
): boolean {
  return dayjs(date).isSameOrBefore(dayjs(value), 'day');
}

export function isSameOrAfterDay(
  date: string | Date,
  value: string | Date,
): boolean {
  return dayjs(date).isSameOrAfter(dayjs(value), 'day');
}

export function isSameTime(date: string | Date, value: string | Date): boolean {
  const dateUTC = dayjs(date).millisecond(0);
  const valueUTC = dayjs(value)
    .set('year', dateUTC.year())
    .set('month', dateUTC.month())
    .set('date', dateUTC.date())
    .millisecond(0);
  return dateUTC.isSame(valueUTC);
}

export function isBeforeTime(
  date: string | Date,
  value: string | Date,
): boolean {
  const dateUTC = dayjs(date).millisecond(0);
  const valueUTC = dayjs(value)
    .set('year', dateUTC.year())
    .set('month', dateUTC.month())
    .set('date', dateUTC.date())
    .millisecond(0);
  return dateUTC.isBefore(valueUTC);
}

export function isBeforeOrSameTime(
  date: string | Date,
  value: string | Date,
): boolean {
  return isBeforeTime(date, value) || isSameTime(date, value);
}

export function isAfterTime(
  date: string | Date,
  value: string | Date,
): boolean {
  const dateUTC = dayjs(date).millisecond(0);
  const valueUTC = dayjs(value)
    .set('year', dateUTC.year())
    .set('month', dateUTC.month())
    .set('date', dateUTC.date())
    .millisecond(0);
  return dateUTC.isAfter(valueUTC);
}

export function isAfterOrSameTime(
  date: string | Date,
  value: string | Date,
): boolean {
  return isAfterTime(date, value) || isSameTime(date, value);
}

export const createDates = (
  startDate: string | Date,
  endDate: string | Date,
): string[] => {
  const between = dayjs(endDate).diff(dayjs(startDate), 'days') + 1;

  return Array.from({ length: between }, (_, i) =>
    dayjs(startDate).add(i, 'day').toISOString(),
  );
};

export const formatShortDate = (date: string | Date): string => {
  return dayjs(date).format(SHORT_DATE);
};

export default function countExpireDate(startDate: Date, priority: string, priorities: any) {
  try {
    let reservationTime = 0;

    switch(true) {
      case priority === 'max':
        reservationTime = priorities.max_priority;
        break;
      case priority === 'high':
        reservationTime = priorities.high_priority;
        break;
      case priority === 'normal':
        reservationTime = priorities.normal_priority;
        break;
      case priority === 'low':
        reservationTime = priorities.low_priority;
        break;
      case priority === 'min':
        reservationTime = priorities.min_priority;
        break;
      default:
        reservationTime = 24;
        break;
    }

    const expandTime = 3600000 * reservationTime;

    return new Date(startDate.getTime() + expandTime);
  } catch(err) {
    console.log(err);
  }
}
import { Pagination } from '@shopify/polaris';
import React from 'react';

export default function TablePagination() {
  return (
    <Pagination
      hasPrevious
      onPrevious={() => {
        console.log('Previous');
      }}
      hasNext
      onNext={() => {
        console.log('Next');
      }}
    />
  );
}

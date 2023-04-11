import { Pagination } from '@shopify/polaris';

type Props = {
  tableRowsPerPage: number;
  totalData: number;
  paginateData: (pageNumber: number) => void;
  currentPage: number;
};

export default function TablePagination({
  tableRowsPerPage,
  totalData,
  paginateData,
  currentPage,
}: Props) {
  const pages = Math.ceil(totalData / tableRowsPerPage);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination
        hasPrevious={currentPage !== 1}
        nextTooltip="Next"
        previousTooltip="Prev"
        onPrevious={() => {
          paginateData(currentPage - 1);
        }}
        hasNext={currentPage !== pages}
        onNext={() => {
          paginateData(currentPage + 1);
        }}
        label={`Page ${currentPage} of ${pages}`}
      />
    </div>
  );
}

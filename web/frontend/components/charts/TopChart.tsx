import { LegacyCard, DataTable, Link } from '@shopify/polaris';

type Props = {
  type: 'abandoned' | 'sold';
};

export default function TopChart({ type }: Props) {
  // const [sortedRows, setSortedRows] = useState(null);

  const initiallySortedRows = [
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Ninja sword
      </Link>,
      643,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        John Wick jacket
      </Link>,
      443,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Terraforming gun
      </Link>,
      413,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Batman mask
      </Link>,
      287,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        PlayStation 5
      </Link>,
      267,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Spiderman webshooters
      </Link>,
      199,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Emerald Silk Crown
      </Link>,
      78,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="emerald-silk-gown"
      >
        Iron man suit
      </Link>,
      56,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="mauve-cashmere-scarf"
      >
        Mauve Cashmere Scarf
      </Link>,
      52,
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Wool Blazer
      </Link>,
      14,
    ],
  ];

  return (
    <LegacyCard
      title={
        type === 'abandoned' ? 'Top Abandoned products' : 'Top Sold Products'
      }
      sectioned
    >
      <DataTable
        columnContentTypes={['text', 'text']}
        headings={[]}
        rows={initiallySortedRows}
        increasedTableDensity
      />
    </LegacyCard>
  );
}

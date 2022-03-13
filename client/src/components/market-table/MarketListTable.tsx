import React from "react";
import styled, { useTheme } from "styled-components";
import { useTable, useRowSelect, Column } from "react-table";
import { IUpbitSocketMessageTicker } from "src/types/upbit";

const StyleBox = styled.div`
  overflow-x: "auto";
  & > table {
    width: 100%;
    border-spacing: 0;
    white-space: nowrap;
    & > tr {
    }
    & tr > th,
    tr > td {
      height: 50;
      padding: 0 10px;
    }
    & > thead {
      color: #212121, & > tr > th {
        border-bottom-style: solid;
        border-bottom-width: 1;
        border-bottom-color: #dadada;
      }
    }
    & > tbody {
      color: #212121;
      & > tr {
        cursor: pointer;
        &:hover {
          background-color: #f1f1f1;
        }
        & > td {
          border-bottom-style: solid;
          border-bottom-width: 1;
          border-bottom-color: #f1f1f1;
        }
      }
    }
  }
`;

export interface IMarketTable extends IUpbitSocketMessageTicker {
  name: string;
  premium: number;
}

interface MarketListTableProps {
  list: Array<IMarketTable>;
}

const MarketListTable: React.FC<MarketListTableProps> = ({ list }) => {
  const theme = useTheme();
  const [pending, setPending] = React.useState(true);
  // const { data, error } = useSWR("/key", fetch);
  const data = React.useMemo<Readonly<typeof list>>(() => list, [list]);
  const columns = React.useMemo<Readonly<Array<Column<IMarketTable>>>>(
    () => [
      {
        Header: "이름",
        accessor: "name",
      },
      {
        Header: "현재가",
        accessor: "trade_price",
      },
      {
        Header: "전일대비",
        accessor: "signed_change_rate",
      },
      {
        Header: "거래액",
        accessor: "acc_trade_price_24h",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => {
      return [...columns];
    });
  });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // selectedFlatRows,
    // state: { selectedRowIds }
  } = tableInstance;

  return (
    <StyleBox>
      <table {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup, headerIndex: number) => {
              const { key: headerGroupsKey, ...headerGroupsArgs } =
                headerGroup.getHeaderGroupProps();
              return (
                // Apply the header row props
                <tr key={headerGroupsKey} {...headerGroupsArgs}>
                  {
                    // Loop over the headers in each row
                    headerGroup.headers.map((column, columnIndex: number) => {
                      const { key: headerGroupKey, ...headerGroupArgs } =
                        column.getHeaderProps();
                      return (
                        // Apply the header cell props
                        <th key={headerGroupKey} {...headerGroupArgs}>
                          {
                            // Render the header
                            column.render("Header")
                          }
                        </th>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            list.length ? (
              rows.map((row, headerIndex: number) => {
                // Prepare the row for display
                prepareRow(row);
                const { key: rowKey, ...rowArgs } = row.getRowProps();
                return (
                  // Apply the row props
                  <tr
                    key={rowKey}
                    {...rowArgs}
                    // onClick={onClickUserName(row.original)}
                  >
                    {
                      // Loop over the rows cells
                      row.cells.map((cell, columnIndex: number) => {
                        const { key: cellKey, ...cellArgs } =
                          cell.getCellProps();
                        // Apply the cell props
                        return (
                          <td key={cellKey} {...cellArgs}>
                            {
                              // Render the cell contents
                              cell.render("Cell")
                            }
                          </td>
                        );
                      })
                    }
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length}>거래가능한 코인이 없습니다.</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </StyleBox>
  );
};
MarketListTable.displayName = "MarketListTable";

export default MarketListTable;

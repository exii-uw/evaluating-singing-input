import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { CircularProgress } from '@material-ui/core';

interface Cell {
    id: string;
    elem: React.ReactNode;
}

interface Row {
    id: string;
    cells: Cell[];
}

interface Props {
    header: Cell[];
    rows: Row[];
    headerCols: number;
    isLoading?: boolean;
}

const CustomTable = ({ header, rows, headerCols, isLoading }: Props) => {
    const halfway = Math.floor(header.length / 2);
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {header.map((cell) => (
                            <TableCell key={cell.id}>{cell.elem}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.cells.slice(0, headerCols).map((cell) => (
                                <TableCell component="th" scope="row" key={cell.id}>
                                    {cell.elem}
                                </TableCell>
                            ))}
                            {row.cells.slice(headerCols).map((cell) => (
                                <TableCell key={cell.id}>{cell.elem}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {isLoading && (
                        <TableRow>
                            {header.slice(0, halfway).map((cell) => (
                                <TableCell key={cell.id} />
                            ))}
                            <TableCell align="center">
                                <CircularProgress />
                            </TableCell>
                            {header.slice(halfway + 1).map((cell) => (
                                <TableCell key={cell.id} />
                            ))}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CustomTable;

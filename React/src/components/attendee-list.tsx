import {
  Search,
  MoreHorizontal,
  ChevronsLeft,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { IconButton } from "./iconbutton";
import { Table } from "./table/table";
import { TableHeader } from "./table/table-header";
import { TableCell } from "./table/table-cell";
import { TableRow } from "./table/table-row";
import { ChangeEvent, useEffect, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface Attendee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  checkedInAt: string | null;
}

export function AttendeeList() {
  const [page, setPage] = useState(() => {
    const url = new URL(window.location.toString());

    if (url.searchParams.has("page")) {
      return Number(url.searchParams.get("page"));
    }
    return 1;
  });
  // const page = 1
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / 10);
  const [search, setSearch] = useState(() => {
    const url = new URL(window.location.toString());

    if (url.searchParams.has("search")) {
      return url.searchParams.get("search") ?? "";
    }
    return "";
  });

  useEffect(() => {
    const url = new URL(
      "http://localhost:3333/events/9e9bd979-9d10-4915-b339-3786b1634f33/attendees"
    );
    url.searchParams.set("pageIndex", String(page - 1));
    if (search.length > 0) {
      url.searchParams.set("query", search);
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setAttendees(data.attendees);
        setTotal(data.total);
      });
  }, [page, search]);

  function setCurrentSearch(search: string) {
    const url = new URL(window.location.toString());
    url.searchParams.set("search", search);
    window.history.pushState({}, "", url);
    setSearch(search);
  }
  function setCurrentPage(page: number) {
    const url = new URL(window.location.toString());
    url.searchParams.set("page", String(page));
    window.history.pushState({}, "", url);
    setPage(page);
  }

  function goToNextPage() {
    setCurrentPage(page + 1);
  }
  function goToPreviousPage() {
    setCurrentPage(page - 1);
  }
  function goToFirstPage() {
    setCurrentPage(1);
  }
  function goToLastPage() {
    setCurrentPage(totalPages);
  }

  function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setCurrentSearch(event.target.value);
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <h1 className="font-bold text-2xl">Participantes</h1>
        <div className="px-3  py-1.5 border border-white/10 rounded-lg flex items-center gap-3">
          <Search className=" size-4 text-emerald-300" />
          <input
            onChange={onSearchInputChanged}
            value={search}
            placeholder="Buscar Participante"
            className="bg-transparent flex-1 outline-none p-0 border-0 text-sm ring-0"
          />
        </div>
      </div>
      <Table>
        <thead className="border-b border-white/10">
          <tr>
            <TableHeader
              style={{ width: 64 }}
              className="py-3 px-4 text-sm font-semibold text-left"
            >
              <input
                type="checkbox"
                className="bg-transparent rounded border  border-white/10"
              />
            </TableHeader>
            <TableHeader>Código</TableHeader>
            <TableHeader>Participante</TableHeader>
            <TableHeader>Data de Inscrição</TableHeader>
            <TableHeader>Data de Check-in</TableHeader>
            <th
              style={{ width: 64 }}
              className="py-3 px-4 text-sm font-semibold text-left"
            ></th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => {
            return (
              <TableRow key={attendee.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="bg-transparent rounded border  border-white/10"
                  />
                </TableCell>
                <TableCell>{attendee.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 ">
                    <span className="font-semibold text-white">
                      {attendee.name}
                    </span>
                    <span>{attendee.email}</span>
                  </div>
                </TableCell>
                <TableCell>{dayjs().to(attendee.createdAt)}</TableCell>
                <TableCell>
                  {attendee.checkedInAt === null ? (
                    <span className="text-zinc-400">Não fez Check-in</span>
                  ) : (
                    dayjs().to(attendee.checkedInAt)
                  )}
                </TableCell>
                <TableCell>
                  <IconButton transparent={true}>
                    <MoreHorizontal className="size-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
        <tfoot>
          <TableRow>
            <TableCell colSpan={3}>
              Mostrando {attendees.length} de {total}
            </TableCell>
            <TableCell colSpan={3} className="text-right">
              <div className="inline-flex items-center gap-8">
                <span>
                  Pagina {page} de {totalPages}
                </span>
                <div className="flex gap-1.5">
                  <IconButton onClick={goToFirstPage} disabled={page === 1}>
                    <ChevronsLeft className="size-4" />
                  </IconButton>
                  <IconButton onClick={goToPreviousPage} disabled={page === 1}>
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={goToNextPage}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={goToLastPage}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight className="size-4" />
                  </IconButton>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  );
}

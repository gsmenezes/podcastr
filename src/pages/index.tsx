import { GetStaticProps } from "next";
import {format, parseISO} from 'date-fns'; //parseISO vai converter para o Date do JS
import ptBR from 'date-fns/locale/pt-BR';
import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDuration";

//tipagem das props - pode ser type ou interface
type Episode = { //separado fica mais didático e de fácil entendimento
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  episodes: Episode[];//array de objetos
}

export default function Home(props: HomeProps) {
  return (
    <div>
      <h1>Index</h1>
    </div>
  );
}

export const getStaticProps:GetStaticProps = async () => {
  const {data} = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  }) //params: limit = limite por página - sort published_at = por data de publicação - order desc = por ordem decrescente

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR }), //format em date js, mostrando dia mês e ano, em português
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,

    }
  })

  return {
    props: {
      episodes: episodes,
    },
    revalidate: 60 * 60 * 8,
  }
}

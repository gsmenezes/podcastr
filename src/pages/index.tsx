import { GetStaticProps } from "next";
import Link from 'next/link'; //torna o carregamento mais performático
import Image from 'next/image'; //componente do next que posso utilizar no lugar das tags img - util para imagens que precisam de otimização - vetor não precisa por ser leve
import {format, parseISO} from 'date-fns'; //parseISO vai converter para o Date do JS
import ptBR from 'date-fns/locale/pt-BR';
import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDuration";
import styles from './home.module.scss';
import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";

//tipagem das props - pode ser type ou interface
type Episode = { //separado fica mais didático e de fácil entendimento
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[];//array de objetos
  allEpisodes: Episode[];
}

export default function Home({latestEpisodes, allEpisodes}) {
  const {play} = useContext(PlayerContext)
  return (
    <div className={styles.homepage}>
    <section className={styles.latestEpisodes}>
      <h2>Últimos lançamentos</h2>
      <ul>
        {latestEpisodes.map(episode => {
          return (
            <li key={episode.id}>
              <Image width={170} height={170} src={episode.thumbnail} alt={episode.title} objectFit="cover" />
              <div className={styles.episodeDetails}>
                <Link href={`/episodes/${episode.id}`}>
                  <a>{episode.title}</a>
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>
              <button type="button" onClick={() => play(episode)}>
                <img src="/play-darkpink.svg" alt="Tocar episódio"/>
              </button>
            </li>
            )
          })}
      </ul>
    </section>
      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map(episode => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72}}>
                    <Image width={120} height={120} src={episode.thumbnail} alt={episode.title} objectFit="cover" />
                  </td>
                  <td>
                    <Link href="">
                    <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100}}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button">
                      <img src="/play-darkpink.svg" alt="Tocar agora"/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
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
          url: episode.file.url,

        }
      })

      const latestEpisodes = episodes.slice(0, 2); //pega os episódios da posição 0 ao 2 do array
      const allEpisodes = episodes.slice(2, episodes.length); //pega todos os episódios a partir da posição 2 até o tamanho do array

      return {
        props: {
          latestEpisodes,
          allEpisodes
        },
        revalidate: 60 * 60 * 8,
      }
    }

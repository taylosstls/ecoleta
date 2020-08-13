import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';

import api from '../../services/api';

import logoEcoleta from '../../assets/images/logo.svg';
import './styles.css';

interface ItemProps {
  id: number;
  title: string;
  image_url: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<ItemProps[]>([]);

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

  return (
    <div id="page-create-point">
      <header>
        <img src={logoEcoleta} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form>
        <h1>
          Cadastro do
          <br />
          ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">
              Nome da entidade:
              <input id="name" name="name" type="text" />
            </label>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">
                Email:
                <input id="email" name="email" type="email" />
              </label>
            </div>
            <div className="field">
              <label htmlFor="whatsapp">
                Whatsapp
                <input id="whatsapp" name="whatsapp" type="text" />
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={[-23.5420615, -46.6995142]} zoom={15}>
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[-23.5420615, -46.6995142]} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">
                Estado (UF)
                <select name="uf" id="uf">
                  <option defaultValue="" disabled hidden>
                    Selecione uma UF
                  </option>
                </select>
              </label>
            </div>

            <div className="field">
              <label htmlFor="city">
                Cidade
                <select name="city" id="city">
                  <option defaultValue="" disabled hidden>
                    Selecione uma cidade
                  </option>
                </select>
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;

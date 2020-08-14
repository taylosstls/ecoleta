import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';

import axios from 'axios';
import api from '../../services/api';

import Modal from '../../components/Modal';

import logoEcoleta from '../../assets/images/logo.svg';
import './styles.css';

interface ItemProps {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEProps {
  id: number;
  sigla: string;
  nome: string;
}

interface CEPProps {
  logradouro: string;
  bairro: string;
  uf: string;
  localidade: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCEP, setSelectedCEP] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    neighborhood: '',
    number: '',
    complement: '',
  });

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [disabled, setDisabled] = useState(true);

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const history = useHistory();

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleGetCEP(event: ChangeEvent<HTMLInputElement>) {
    const cepItem = event.target.value;

    setSelectedCEP(cepItem);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleSelectItem(id: number) {
    const alreaySelected = selectedItems.findIndex((item) => item === id);

    if (alreaySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const {
      name,
      email,
      whatsapp,
      address,
      neighborhood,
      number,
      complement,
    } = formData;

    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const zipcode = selectedCEP;
    const itemsRecicly = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      zipcode,
      address,
      neighborhood,
      number,
      complement,
      city,
      uf,
      items: itemsRecicly,
    };

    //    console.log(data);
    await api.post('points', data);

    alert('Ponto de coleta cadastrado com sucesso!');

    history.push('/');
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setSelectedPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    if (selectedCEP.length >= 8 && selectedCEP.length <= 9) {
      axios
        .get<CEPProps>(`https://viacep.com.br/ws/${selectedCEP}/json/`)
        .then((response) => {
          const { bairro, logradouro, uf, localidade } = response.data;

          setFormData({
            ...formData,
            address: logradouro,
            neighborhood: bairro,
          });
          setSelectedCity(localidade);
          setSelectedUf(uf);
        });
    }
  }, [selectedCEP, formData]);

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEProps[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);

        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      // eslint-disable-next-line no-useless-return
      return;
    }

    axios
      .get<IBGEProps[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`,
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);
        setCities(cityNames);
      });

    setDisabled(false);
  }, [selectedUf]);

  return (
    <div id="page-create-point">
      <Modal />
      <header>
        <img src={logoEcoleta} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
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
              <input
                id="name"
                name="name"
                type="text"
                onChange={handleInputChange}
              />
            </label>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">
                Email:
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="field">
              <label htmlFor="whatsapp">
                Whatsapp
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="number"
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={selectedPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openaddressmap.org">OpenaddressMap</a> contributors'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group group-cep">
            <div className="field">
              <label htmlFor="zipcode">
                CEP:
                <input
                  type="number"
                  name="zipcode"
                  id="zipcode"
                  value={selectedCEP}
                  onChange={handleGetCEP}
                />
              </label>
            </div>

            <div className="field">
              <label htmlFor="address">
                Logradouro:
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>

          <div className="field-group group-address">
            <div className="field">
              <label htmlFor="neighborhood">
                Bairro:
                <input
                  type="text"
                  name="neighborhood"
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="field">
              <label htmlFor="uf">
                Estado (UF)
                <select
                  name="uf"
                  id="uf"
                  value={selectedUf}
                  onChange={handleSelectUF}
                >
                  <option defaultValue="0" hidden>
                    Selecione
                  </option>
                  {ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field">
              <label htmlFor="city">
                Cidade
                <select
                  disabled={disabled}
                  value={selectedCity}
                  onChange={handleSelectCity}
                  name="city"
                  id="city"
                >
                  <option defaultValue="0" hidden>
                    Selecione
                  </option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="field-group group-cep">
            <div className="field">
              <label htmlFor="number">
                Número:
                <input
                  type="number"
                  name="number"
                  id="number"
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="field">
              <label htmlFor="complement">
                Complemento:
                <input
                  type="text"
                  name="complement"
                  id="complement"
                  onChange={handleInputChange}
                />
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
              <li
                key={item.id}
                onClick={() => {
                  handleSelectItem(item.id);
                }}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                aria-hidden="true"
              >
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

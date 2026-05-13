import { Link } from 'react-router-dom'

const categories = [
  {
    title: 'Ceramique & Poterie',
    subtitle: "L'art ancestral de Fes et Safi",
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2nmK79ZEMDJ9jfGNpZ1j98ing5AnYeVio5_ngs8kj_aeQUUiENLPrfGSY2NRLfVjjtLaE5g9l6gGGSuzvBaFcFg9J7309jvdJ7HcaXnZPTrBske7pZQBYIrESDNcVQWubSV0s8ygSQ1Zcn4y1Lrl-5vvZe0FYVmbg5piVWfue5k9u-kdWDHEniO0d-VXwtn9AJHCGEZljpIt1L-QIy-FaB7ZvnRJmQQTGbJh2UJs8dw5lTEnLu5D-954E04mCDQuc6tCK7BbpDIc',
    size: 'tile--large',
  },
  {
    title: 'Maroquinerie',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn9WCIgkokEZDedRN3J5zmr1vCL2IJUknc_vAjD3r6Zgi_qmnuLOfyuM1QvEve4fXiBxQaFKZhLFgnz43aVZhkKLhmXV8RnPnxkJQInKkkdN2V0H_zWXzQ0MYCORqNHRbR1kB-n9f7v0XEARwdzMQbPTgspshVC1xwBEtTtZfZDN9pr1ZLsrVFMjpKvoUbMPbBKKM51BosHeO4nU8RN33gYv_gaScY71EuIhWd2U7Ixui9WpQyqTHlfjEuFdxw8M8Cyp3efsgtYcs',
    size: '',
  },
  {
    title: 'Tapis & Tissage',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRZMTOBzKtqnXs-zOHwuVtxO50_2IELrMKKwvKGh1rRt-hWI0uniprMP30CCB4s-Fi7KbwY6pLJEceJpSJXnvOwejwOop3WhgORiS4zQhVfJVCN4idQFPqywa66VV1wzAaSq8K2W4tipjzuWHrHT6eln7Z3_n6WE4sUlC-VSTudD4f2BLa5gfYTCCKcbhY7e03VON-YjlrgH2rxozvmkOPXtQSg6vb29jbE5yk0eNSm5YlczZCI1cMXDzsMuSKAXcEaNmtoBo0vzA',
    size: '',
  },
  {
    title: 'Dinanderie & Cuivre',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdqWQs77OlT2G93D7_9gCXGx9STLicn3bVB1Toq2T5R6Z7JksQT-PLsz9AoDH8moLeSWmWmSE5GZ76oYNXnPqAsu2oO4Wgy0pRM1a1q_whu-4b8ORNCzNQ2luWBPjO7BB7rB4c2dxIyxZqYf95VRbfBGVPiSuR2TKlxtXMKUBIfGKFJDXsr2JZrOHZ20rIh1WF5eus_J3TnauCXdNiQDgW9lk7VEPH2MGR8_9JdqxLNdlzUm8Sc1JuYppS2cgzmXfspH3pYvPEpYk',
    size: 'tile--wide',
  },
]

const products = [
  {
    title: 'Tajine Decoratif "Bleu Royal"',
    tag: 'Ceramique de Safi',
    price: '450 DH',
    rating: '4.9',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMBRlWFuSBFiUBMfoH5xHjN7WAvrjJH0Hx94XNRsshxRO3v2qc-tUwYdKaFqoO66ZansFe2qYNbmmJ5terJ9IhpnHKPgmzv4HGXhvFYtuasnnbKcrrWB8KNnslyM0Cb5H3DVoLCO6E9Dlpl-i-8sEVoVdjEEBQ8G475LebxrhTo31jHO-RK8nxRhk_zv3-LJyckqevq-4TtzdWQm01M1wtbacmjjhd3-IJVJEDLcJJnNpXUwEaE159rOtrLkfNr94ThLsDNNshfB8',
    badge: 'Best Seller',
    badgeStyle: 'product__badge--secondary',
  },
  {
    title: 'Babouches Artisanales Saffian',
    tag: 'Maroquinerie de Luxe',
    price: '280 DH',
    rating: '4.8',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwOIpMBr58DF4DYlJxxj6eOjOtPCxx9dJrkYaSZm2KDzq_2sE72oTncvVE5EYeIKbxz34mnd9oUtxBB3-cG_aFmYziXRxhmQChlxvaRfCs17imDsDgoS-C4LLc2W3Un7Jg4VUD3Fohiofhvm_sDqUfDDaEG2k8ZeWksxz9_N8aBovqi7Y2PJwW2pDAyAprkA6FoIBJvtH6llUJvDnLlAKvf3vG7TOZEb6COne-YdpVcQdUSjKhSdiv9v7ercbTLiarg8yqyp0dops',
    badge: 'Nouveau',
    badgeStyle: 'product__badge--primary',
  },
  {
    title: 'Coffret en Cedre Sculpte',
    tag: 'Ebenisterie',
    price: '650 DH',
    rating: '5.0',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6LvDr1iwGNNvNM4JYziU4NOMf0rdJF-CUULvSjyI0pzqvxr5pUlpKRbj4GlkES2HlJM2oqH-iVljLyAPnNU2HfMFQILvC7FKRreL3T_5S0sydWf-9dofC1kigeBfgx987Ko-pjYJVfG_L5ujV3eQPQjglNyIDWHtDmDCDqYn1_To4PFZvxSv5BeW7LOeivlSQwOPwvG_1pbj9Fq2D9hwio27knm_dMmEaditjgL9yi_lJwv2uZ-sUvKLjSbP7Pspqz3OtMAS2vP8',
    badge: 'Premium',
    badgeStyle: 'product__badge--secondary',
  },
  {
    title: 'Miroir en Cuivre Martelle',
    tag: 'Dinanderie',
    price: '1,200 DH',
    rating: '4.7',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDw7I81rraHrC8vOxdzt8cCcg-vR-Y14dZWROLCp3GDOoEe6z1zfti-XHL4v3ls61b6h7fANm8JsX8VhxkaWiRa9Z710pvoLUD-tSa-EJm83wBIrqPRi8lJp_PRqGjCdwBgA6z2lggUdS4pZ4vU015fXt89K4ClqFOM1aX7KfIfpqOClHrOAHYHBnD9GpH5_qNXMsneNiu7tia5zT4nZLGNeMesRtkYc6bsw30vNqF07Qy__3Xcyt-nXXqEAjGETKzRwUx4x08Q_k',
    badge: '',
    badgeStyle: '',
  },
]

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__inner shell-frame">
          <div>
            <div className="hero__badge">
              <span>verified</span>
              <span>Artisanat Certifie</span>
            </div>
            <h1>L'excellence de l'artisanat marocain a votre portee.</h1>
            <p>
              Decouvrez une selection rigoureuse d'objets uniques faconnes par
              les meilleurs M3alems. Qualite, tradition et modernite reunies.
            </p>
            <div className="hero__actions">
              <a className="button" href="#catalogue">
                Explorer les produits
              </a>
              <Link className="button--ghost" to="/pages/connexion">
                Devenir Exposant
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtjN42VSuaH3nhNjfepS5UxVbcr9-MC6XCtcJwkkDlr2lR2YqROsOLQvc2tMHZ3qghDn9SUdXSjBwnjNDmocmORiCdvXbdkMzkDcbfQ1zcr_Y3gKMrRTXFe5VwRhspMaYQ47ZNNpoa6LQinoFgBr96IejrEcVJhQOh_m-SXydkXZI0-yGx_Z5sXxzp4oRQGLoq6IWoZLNlJatDnaOcqnRvS9J-9P4Z9QHOCmK-nqvgXhv_-T1BL8EN6L6R0n-O4voK6_x4f0yhik4"
              alt="Artisan travaillant le bois de cedre"
            />
          </div>
        </div>
      </section>

      <section className="section shell-frame" id="catalogue">
        <div className="section__head">
          <div>
            <h2>Categories d'Exception</h2>
            <p>Parcourez nos univers artisanaux</p>
          </div>
          <a className="section__action" href="#featured">
            Voir tout <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="bento">
          {categories.map((category) => (
            <article className={`tile ${category.size}`} key={category.title}>
              <img src={category.image} alt={category.title} />
              <div className="tile__overlay">
                <div>
                  <h3>{category.title}</h3>
                  {category.subtitle ? <p>{category.subtitle}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="featured" id="featured">
        <div className="shell-frame">
          <div className="section__head">
            <h2>Produits en Vedette</h2>
            <div className="topbar__actions" aria-hidden="true">
              <span className="icon-button">←</span>
              <span className="icon-button">→</span>
            </div>
          </div>

          <div className="products">
            {products.map((product) => (
              <article className="product" key={product.title}>
                <div className="product__media">
                  <img src={product.image} alt={product.title} />
                  {product.badge ? (
                    <div className={`product__badge ${product.badgeStyle}`}>
                      <span>star</span>
                      <span>{product.badge}</span>
                    </div>
                  ) : null}
                  <button type="button" className="icon-button product__fav" aria-label="Favori">
                    fav
                  </button>
                </div>
                <div className="product__body">
                  <p className="eyebrow">{product.tag}</p>
                  <h4>{product.title}</h4>
                  <div className="product__meta">
                    <span className="product__price">{product.price}</span>
                    <span className="product__rating">
                      <span aria-hidden="true">★</span>
                      {product.rating}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="products__cta">
            <Link className="button" to="/pages/catalogue">
              Voir tout le catalogue
            </Link>
          </div>
        </div>
      </section>

      <section className="shell-frame" id="atelier">
        <div className="spotlight">
          <div>
            <h2>Rencontrez nos M3alems</h2>
            <p>
              Derriere chaque produit se cache une histoire, un savoir-faire
              transmis de generation en generation. Decouvrez les visages de
              l'artisanat marocain.
            </p>

            <div className="spotlight__stats">
              <div className="stat">
                <div className="stat__badge stat__badge--primary">50+</div>
                <span>Artisans certifies</span>
              </div>
              <div className="stat">
                <div className="stat__badge stat__badge--secondary">12</div>
                <span>Villes representees</span>
              </div>
            </div>
          </div>

          <div className="spotlight__images">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVzcFlcp6yiST1JR6bXQWVcrQJsX7Msnt5B_naiDG8x5EiJWDSmZ2L4i7rUOcc5LBpwtGfNDtexQSgJQd60fW4ZEfXD0SciiUTTES_wrTbE-_S1dYDxn8nGM8iQR-Mgopq-JWt1uFz5OaQVdRBiSQSr__P7qMIjcoM96wnKQWAbI1HHeB-0LIayznxvpMHXv-0v0T6XX4cWmAjnzR8Gnmy4qp4aBJiDiNOzwHmuYYgkJ8-cPbsvNzWrp4wToQVB3spkvNJjSPp6RQ"
              alt="Artisan age travaillant le cuir"
            />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_g457GytyrvAtvMmbIPwuiid3w1wbuiwqy8XozsVX38pKfWlrl1cLfDVBCOSeWV10Kuc1Isa8IhNnPcMu7xSGTanIYZnHLo1nnB3KpzuFwzJXBdvzbA2XuFdULbQLFhYDvRPeTBvcYQdpldJIbKXwvJJwcwJZgc2srZwfWMnCZfJGPH-1yYx8CGrWyzWiMwzgmhp3fKR6kQLGTcSnRHqlMqm6M6NIiq0LKU9Av75TqvrIFGOMAYo-wPnZr9vWZA4EBRg5wdkrwxA"
              alt="Artisane peignant des motifs ceramiques"
            />
          </div>
        </div>
      </section>
    </>
  )
}

function Card({name, description, interests}){
return <div className="card">
    <h2>{name}</h2>
    <p>{description}</p>

    <h3>Interests</h3>
    <ul>
    {interests.map(interest => <li>{interest}</li>)}
    </ul>

    <div>
        <button>Linked in</button>
        <button>Twitter</button>
    </div>
</div>
}

export default Card;
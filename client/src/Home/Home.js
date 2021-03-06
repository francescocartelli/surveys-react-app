import { useEffect, useState } from 'react';
import { Alert, Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './Home.css'

import API from '../API'

function Home(props) {
    const [allSurveys, setAllSurveys] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        API.getSurveys().then(s => {
            setAllSurveys(s)
        }).catch(err => {
            setError(err.message)
        })
    }, [])

    return (
        <div className="bg-light vh-100">
            <div className="text-center title-container bg-white">
                <p className="title">Welcome to <strong>.surveys</strong></p>
                <p className="subtitle">Your opinion is important!
                    <br />Browse this page and find the latest published surveys.
                </p>
            </div>
            <Container className="surveys-list">
                {
                    allSurveys.map(s => {
                        return <SurveyCard key={"survey_" + s.id} survey={s}></SurveyCard>
                    })
                }
                {
                    error && <Alert variant="danger">{error}</Alert>
                }
            </Container>
        </div>
    )
}

function SurveyCard(props) {
    return (
        <Container className="card-body">
            {
                props.survey && <>
                    <h2>{props.survey.title ? props.survey.title : "no title"}</h2>
                    <Row className="pt-1 pb-1 align-center">
                        <Col xs={0}></Col>
                        <Col xs={12} ><Link to={"/survey/" + props.survey.id}><Button variant="info" className="large-button">Answer this survey!</Button></Link></Col>
                        <Col xs={0}></Col>
                    </Row>
                </>
            }

        </Container>
    )
}

export { Home };
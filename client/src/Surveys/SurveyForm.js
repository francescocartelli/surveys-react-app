import { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Alert } from 'react-bootstrap'
import './style.css'
import { useHistory, useParams } from 'react-router-dom'

import API from '../API'
import { ClosedQuestion, OpenQuestion } from './Question'
import { Confirmation, Information, UserModal } from '../Modals/Modals'

function SurveyForm(props) {
    // Id of the survey
    let { id } = useParams()
    // State of the suvey object
    const [survey, setSurvey] = useState({ questions: [] })
    // User answers is a duplication of the useState contained inside of the
    // questions in this form
    // When submit button is clicked, those answers will be sent to database all together
    // This useState is initialized once in the useEffect of this form
    const [userAnswers, setUserAnswers] = useState([])
    const [username, setUsername] = useState("nameless")
    const [error, setError] = useState([])

    const history = useHistory()

    // Modals
    const [isUserModal, setIsUserModal] = useState(false)
    const [isConfirmation, setIsConfimation] = useState(false)
    const [isInformation, setIsInformation] = useState(false)
    const [isWarning, setIsWarning] = useState(false)
    const [warning, setWarning] = useState({ title: "", text: "" })

    const validateAnswers = () => {
        // Checking for any missed mandatory question
        let errorMessage = []
        survey.questions.forEach((q, i) => {
            if (q.type === 0) {
                let num = userAnswers[i].values.length
                if (num < q.min) {
                    errorMessage.push("Question " + (i + 1) + " require " + q.min + " answers, " + num + " were given")
                }
            } else {
                if (q.min > 0 && !userAnswers[i].values) {
                    errorMessage.push("Question " + (i + 1) + " require an answer")
                }
            }
        })

        setError(errorMessage)

        if (errorMessage.length > 0) {
            setWarning({ title: "Survey not complete", text: "Some questions are incomplete, check the error message and complete the answer mandatory questions." })
            setIsWarning(true)
        } else {
            setIsConfimation(true)
        }
    }

    const submitUserAnswers = () => {
        API.submitUserAnswers(id, username, userAnswers).then(() => {
            setIsInformation(true)
        }).catch(err => {
            setWarning({ title: "Warning", text: err.message })
            setIsWarning(true)
        })
    }

    useEffect(() => {
        API.getSurvey(id)
            .then(s => {
                setIsUserModal(true)
                setSurvey(s)
                // For each answer we map an empty user answer
                setUserAnswers((prev) => {
                    return s.questions.map((q) => {
                        return { id: q.id, type: q.type, values: null }
                    })
                })
            }).catch(err => {
                setIsWarning(true)
                setWarning({ title: "Survey not found", text: err.message })
            })
    }, [props, id])

    return (
        <Container fluid>
            <UserModal
                isShow={isUserModal}
                setUsername={setUsername}
                onClose={() => setIsUserModal(false)}
            />
            <Confirmation
                title="Confirm survey submission"
                text="Are you sure you want to submit this survey?"
                isShow={isConfirmation}
                onConfirm={() => {
                    setIsConfimation(false)
                    submitUserAnswers()
                }}
                onClose={() => setIsConfimation(false)}
                onHide={() => setIsConfimation(false)}
            />
            <Information
                title="The survey has been submitted"
                text="You will be redirected to the home page."
                isShow={isInformation}
                onClose={() => {
                    setIsInformation(false)
                    history.push("/home")
                }}
                onHide={() => {
                    setIsInformation(false)
                    history.push("/home")
                }}
            />
            <Information
                title={warning.title}
                text={warning.text}
                isShow={isWarning}
                onClose={() => setIsWarning(false)}
                onHide={() => setIsWarning(false)}
            />
            <Row className="pt-2 pb-2 m-0">
                <Col className="pl-0">
                    {
                        <h2>{survey.title}</h2>
                    }
                </Col>
                <Col xs="12">
                    <Alert variant="success">
                        Your username for this survey: {username}
                    </Alert>
                </Col>
                {
                    error.length > 0 && <Col xs={12}>
                        <Alert variant="danger">{error.map(e => <p>{e}<br /></p>)}</Alert>
                    </Col>
                }
                {
                    survey.questions &&
                    survey.questions.map((q, i) => {
                        return q.type === 0 ?
                            <ClosedQuestion
                                key={"quest_" + q.id}
                                question={q}
                                number={i}
                                checked={[]}
                                setUserAnswers={setUserAnswers}></ClosedQuestion> :
                            <OpenQuestion
                                key={"quest_" + q.id}
                                question={q}
                                number={i}
                                setUserAnswers={setUserAnswers}></OpenQuestion>
                    })
                }
            </Row>
            {
                survey.id !== undefined ?
                    <Row className="mb-3">
                        <Col></Col>
                        <Col xs="12" md="9">
                            <Button className="button-wide button-tall" onClick={() => validateAnswers()}>Submit Survey</Button>
                        </Col>
                        <Col></Col>
                    </Row> :
                    <Row className="mb-3">
                        <Col></Col>
                        <Col xs="12" md="9">
                            <Button className="button-wide button-tall" onClick={() => history.push("/home")}>Go back to home</Button>
                        </Col>
                        <Col></Col>
                    </Row>
            }
        </Container>
    )
}

export { SurveyForm }




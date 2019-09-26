/* eslint-disable react/static-property-placement */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  IssueFilter,
  Pagination,
  NextPageButton,
  PreviousPageButton,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    firstPage: true,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          page,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  getIssues = async () => {
    const { match } = this.props;
    const { page, state } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page,
        per_page: 5,
      },
    });

    await this.setState({
      issues: issues.data,
      loading: false,
    });
  };

  handleFilter = async value => {
    await this.setState({ page: 1, firstPage: true, state: value });
    this.getIssues();
  };

  previousPageHandle = async () => {
    const { page } = this.state;

    if (page > 1) {
      const pg = page - 1;
      await this.setState({ page: pg });
      if (pg === 1) {
        await this.setState({ firstPage: true });
      }
      this.getIssues();
    }
  };

  nextPageHandle = async () => {
    const { page } = this.state;
    const pg = page + 1;

    await this.setState({ page: pg, firstPage: false });

    this.getIssues();
  };

  render() {
    const { repository, issues, loading, firstPage } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos Repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueFilter>
          <RadioGroup onChange={this.handleFilter} value="" horizontal>
            <RadioButton
              value="all"
              iconSize={20}
              rootColor="#969da2"
              pointColor="#4300b0"
            >
              All
            </RadioButton>
            <RadioButton
              value="open"
              iconSize={20}
              rootColor="#969da2"
              pointColor="#4300b0"
            >
              Open
            </RadioButton>
            <RadioButton
              value="closed"
              iconSize={20}
              rootColor="#969da2"
              pointColor="#4300b0"
            >
              Closed
            </RadioButton>
          </RadioGroup>
        </IssueFilter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <PreviousPageButton
            firstPage={firstPage}
            onClick={this.previousPageHandle}
          >
            <FaAngleLeft color="#FFF" size={40} />
          </PreviousPageButton>
          <NextPageButton onClick={this.nextPageHandle} type="button">
            <FaAngleRight color="#FFF" size={40} />
          </NextPageButton>
        </Pagination>
      </Container>
    );
  }
}
